export function useGoldPrice() {
  const goldStore = useGoldStore()

  onMounted(() => {
    goldStore.fetchCurrent()
    goldStore.fetchHistory()
    goldStore.fetchInternational()
    goldStore.fetchXaut()
    goldStore.fetchInternationalHistory()
    goldStore.fetchXautHistory()
  })

  return goldStore
}
