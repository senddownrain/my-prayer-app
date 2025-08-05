import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const auth = getAuth();
  const loading = ref(true);

  // --- ✅ ЛОГИРОВАНИЕ ВНУТРИ ХРАНИЛИЩА ---
  console.log('[AUTH STORE] Initializing...');

  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    // Этот лог покажет нам КАЖДЫЙ раз, когда Firebase меняет статус
    console.log(`%c[FIREBASE AUTH STATE CHANGED] User status updated.`, 'color: #881391; font-weight: bold;', firebaseUser ? `Logged in as ${firebaseUser.email}` : 'Logged out.');
    user.value = firebaseUser;
    loading.value = false;
  });

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // После успешного входа, роутер сам перенаправит куда нужно
      // Добавляем небольшой таймаут, чтобы дать роутеру время на обработку нового состояния
      setTimeout(() => {
        const redirectPath = router.currentRoute.value.query.redirect || '/';
        router.push(redirectPath);
      }, 100);

    } catch (error) {
      console.error("Login Error:", error.code);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    // При выходе всегда перенаправляем на страницу входа
    router.push({ name: 'Login' });
  };
  
  const unbind = () => {
    unsubscribe();
  };

  return { user, login, logout, unbind, loading };
});