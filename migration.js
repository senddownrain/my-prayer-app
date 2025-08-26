const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch, doc } = require("firebase/firestore");

// ВАЖНО: Вставьте вашу конфигурацию Firebase сюда
const firebaseConfig = {
  apiKey: "AIzaSyDF2TD4MTcKiBChKRssauvL-nNyT4Am9N0",
  authDomain: "molitwy.firebaseapp.com",
  projectId: "molitwy",
  storageBucket: "molitwy.firebasestorage.app",
  messagingSenderId: "654293224787",
  appId: "1:654293224787:web:5f4fce64abf5ba1b1ea5a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateData() {
    console.log("Starting migration...");
    const itemsCollection = collection(db, 'items');
    const snapshot = await getDocs(itemsCollection);

    if (snapshot.empty) {
        console.log("Collection is empty. Nothing to migrate.");
        return;
    }

    const batch = writeBatch(db);
    const newItemsToLink = []; // [{ lang: 'be', newId: '...' }, { lang: 'ru', newId: '...' }]

    for (const oldDoc of snapshot.docs) {
        const data = oldDoc.data();
        
        // Проверяем, есть ли titleVersions. Если нет, скорее всего, документ уже в новом формате.
        if (!data.titleVersions) {
            console.log(`Skipping document ${oldDoc.id}, it seems to be in the new format.`);
            continue;
        }

        console.log(`Processing document: ${oldDoc.id}`);
        const generatedItems = []; // Для хранения ID новых документов, созданных из одного старого

        const allLangs = new Set([
            ...Object.keys(data.titleVersions || {}),
            ...Object.keys(data.textVersions || {})
        ]);

        for (const lang of allLangs) {
            const title = data.titleVersions?.[lang];
            const text = data.textVersions?.[lang];

            // Создаем новую заметку, только если есть заголовок
            if (title) {
                const newDocRef = doc(collection(db, 'items')); // Генерируем новый ID
                
                const newItemData = {
                    id: newDocRef.id,
                    title: title,
                    text: text || '',
                    lang: lang,
                    tags: data.tags || [],
                    source: data.source || '',
                    linkedNoteIds: data.linkedNoteIds || [], // Старые связи переносим
                    translationIds: [], // Пока оставляем пустым
                    isNovenaPrayer: data.isNovenaPrayer || false,
                    recommendedDate: data.recommendedDate || null,
                    hidden: data.hidden || false,
                    createdAt: data.createdAt // Сохраняем старую дату создания
                };

                batch.set(newDocRef, newItemData);
                generatedItems.push(newDocRef.id);
                console.log(`  - Staged new item for lang '${lang}' with new ID ${newDocRef.id}`);
            }
        }

        // Добавляем информацию для последующей сшивки переводов
        if (generatedItems.length > 0) {
             newItemsToLink.push(generatedItems);
        }

        // Помечаем старый документ на удаление
        batch.delete(oldDoc.ref);
        console.log(`  - Staged old document ${oldDoc.id} for deletion.`);
    }

    // Второй этап: связываем переводы между собой
    console.log("\nStaging translation links...");
    for (const group of newItemsToLink) {
         for (const itemId of group) {
            const itemRef = doc(db, 'items', itemId);
            // Каждый элемент в группе должен ссылаться на все остальные в той же группе
            const translations = group.filter(id => id !== itemId);
            batch.update(itemRef, { translationIds: translations });
            console.log(`  - Staged links for ${itemId}: [${translations.join(', ')}]`);
        }
    }
    
    try {
        console.log("\nCommitting all changes to Firestore. This may take a moment...");
        await batch.commit();
        console.log("\n✅ Migration completed successfully!");
        console.log("All old documents have been replaced with new, linked documents.");
    } catch (error) {
        console.error("\n❌ CRITICAL ERROR during migration commit:", error);
        console.log("No changes were saved to the database.");
    }
}

migrateData();