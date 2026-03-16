const createNoopStorage = () => ({
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  });
  
  const storage =
    typeof window === 'undefined'
      ? createNoopStorage()
      : {
          getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
          setItem: (key: string, value: string) => 
            Promise.resolve(window.localStorage.setItem(key, value)),
          removeItem: (key: string) => 
            Promise.resolve(window.localStorage.removeItem(key)),
        };
  
  export default storage;