export default () => ({
  azure_storage: {
    account_name: process.env.AZURE_STORAGE_ACCOUNT,
    account_key: process.env.AZURE_STORAGE_ACCESS_KEY,
    containers: {
      tmp: process.env.TMP_CONTAINER_NAME || 'tmp',
      private: process.env.PRIVATE_CONTAINER_NAME || 'private',
    },
  },
})
