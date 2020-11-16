export function format(data) {
  return {
    toDollar() {
      return !data && data !== 0
        ? ''
        : `$ ${data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },
    toNumber() {
      return !data && data !== 0
        ? ''
        : data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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

export function debounce(func, wait, immediate) {
  let timeout
  return function () {
    const context = this
    const args = arguments
    const later = function () {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}

export function textareaAutoResize() {
  const tx = document.getElementsByTagName('textarea')
  for (let i = 0; i < tx.length; i++) {
    tx[i].setAttribute(
      'style',
      'height:' + tx[i].scrollHeight + 'px;overflow-y:hidden;'
    )
    tx[i].addEventListener('input', OnInput, false)
  }

  function OnInput() {
    this.style.height = 'auto'
    this.style.height = this.scrollHeight + 'px'
  }
}
