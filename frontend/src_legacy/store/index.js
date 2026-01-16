import { createStore } from 'vuex';

export default createStore({
  state: {
    isLoading: false,
    notifications: [],
    user: {
      name: 'Administrateur',
      role: 'admin'
    }
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        ...notification,
        id: Date.now(),
        read: false
      });
    },
    MARK_AS_READ(state, id) {
      const notification = state.notifications.find(n => n.id === id);
      if (notification) notification.read = true;
    }
  },
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading);
    },
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
    },
    markAsRead({ commit }, id) {
      commit('MARK_AS_READ', id);
    }
  },
  getters: {
    isLoading: state => state.isLoading,
    unreadNotifications: state => state.notifications.filter(n => !n.read)
  }
});