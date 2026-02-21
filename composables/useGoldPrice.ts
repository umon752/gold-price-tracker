export function useGoldPrice() {
  const goldStore = useGoldStore()

  onMounted(async () => {
    await goldStore.fetchCurrent()
    await goldStore.fetchHistory()
    goldStore.fetchInternational()
  })

  return goldStore
}
