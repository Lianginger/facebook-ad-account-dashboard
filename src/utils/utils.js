export function format(data) {
  return {
    toDollar() {
      return !data
        ? ''
        : `$ ${data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },
    toNumber() {
      return !data ? '' : data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    toProjectTime() {
      const [date, time] = data.split('T')
      return !data ? '' : `${date} ${time.substring(0, 5)}`
    },
    toPercentage() {
      if (!data) {
        return ''
      }
      return `${Number(data * 100).toFixed(1)} %`
    },
    toDate() {
      // input unix time
      const newDate = new Date(data)
      const year = newDate.getFullYear()
      const month = ('0' + (newDate.getMonth() + 1)).slice(-2)
      const date = ('0' + newDate.getDate()).slice(-2)
      return !data ? '' : `${year}-${month}-${date}`
    },
    toTime() {
      // input unix time
      const newDate = new Date(data)
      const hours = ('0' + newDate.getHours()).slice(-2)
      const minutes = ('0' + newDate.getMinutes()).slice(-2)
      return !data ? '' : `${hours}:${minutes}`
    },
  }
}
