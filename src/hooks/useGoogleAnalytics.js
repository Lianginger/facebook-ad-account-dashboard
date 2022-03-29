import React, { useEffect, useState } from 'react'

const useGoogleAnalytics = (reportRequests, fetchCount) => {
  const [data, setData] = useState({})
  const gaRequestData = {
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: {
      reportRequests,
    },
  }

  let tokenClient

  async function getToken(err) {
    if (
      err.result.error.code === 401 ||
      (err.result.error.code === 403 &&
        err.result.error.status === 'PERMISSION_DENIED')
    ) {
      // The access token is missing, invalid, or expired, prompt for user consent to obtain one.
      await new Promise((resolve, reject) => {
        try {
          // Settle this promise in the response callback for requestAccessToken()
          tokenClient.callback = (resp) => {
            if (resp.error !== undefined) {
              reject(resp)
            }
            // GIS has automatically updated gapi.client with the newly issued access token.
            // console.log(
            //   'gapi.client access token: ' +
            //     JSON.stringify(window.gapi.client.getToken())
            // )
            resolve(resp)
          }

          tokenClient.requestAccessToken()
        } catch (err) {
          console.log(err)
        }
      })
    } else {
      // Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
      throw new Error(err)
    }
  }

  function queryReports() {
    window.gapi.client
      .request(gaRequestData)
      .then((res) => {
        setData(generateDateToGoal(res))
      })
      .catch((err) => getToken(err)) // for authorization errors obtain an access token
      .then((retry) => window.gapi.client.request(gaRequestData))
      .then((res) => {
        setData(generateDateToGoal(res))
      })
      .catch((err) => console.log(err)) // cancelled by user, timeout, etc.
  }

  function generateDateToGoal(res) {
    // console.log('res', res)

    const { rows, totals } = res.result.reports[0].data
    // console.log('totals', totals)
    // console.log('rows', rows)

    const dateToGoalMap = {}

    if (!rows || rows.length === 0) {
      return dateToGoalMap
    }

    dateToGoalMap['total'] = Number(totals[0].values[0])
    rows.forEach(({ dimensions, metrics }) => {
      let date = dimensions[0]
      date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      const value = metrics[0].values[0]
      dateToGoalMap[date] = Number(value)
    })

    // console.log('dateToGoalMap', dateToGoalMap)
    return dateToGoalMap
  }

  useEffect(() => {
    if (fetchCount === 0) {
      return
    }
    let gapiLoadOkay
    let gapiLoadFail
    let gisLoadOkay
    let gisLoadFail

    // 處理載入完才顯示的問題

    const gapiLoadPromise = new Promise((resolve, reject) => {
      gapiLoadOkay = resolve
      gapiLoadFail = reject
    })
    const gisLoadPromise = new Promise((resolve, reject) => {
      gisLoadOkay = resolve
      gisLoadFail = reject
    })

    ;(async () => {
      // First, load and initialize the gapi.client
      await gapiLoadPromise
      await new Promise((resolve, reject) => {
        // NOTE: the 'auth2' module is no longer loaded.
        window.gapi.load('client', { callback: resolve, onerror: reject })
      })
      await window.gapi.client.init({
        // NOTE: OAuth2 'scope' and 'client_id' parameters have moved to initTokenClient().
      })

      // Now load the GIS client
      await gisLoadPromise
      await new Promise((resolve, reject) => {
        try {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id:
              '577256234296-krnknsj2vflrk1vagg05aorhsj9pugh3.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            prompt: 'consent',
            callback: '', // defined at request time in await/promise scope.
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      queryReports()
    })()

    const gapiScript = document.createElement('script')
    gapiScript.src = 'https://apis.google.com/js/api.js'
    gapiScript.async = true
    gapiScript.defer = true
    gapiScript.onload = gapiLoadOkay
    gapiScript.onerror = gapiLoadFail

    const gisScript = document.createElement('script')
    gisScript.src = 'https://accounts.google.com/gsi/client'
    gisScript.async = true
    gisScript.defer = true
    gisScript.onload = gisLoadOkay
    gisScript.onerror = gisLoadFail

    document.body.appendChild(gapiScript)
    document.body.appendChild(gisScript)

    // return () => {
    //     document.body.removeChild(script);
    // };
  }, [fetchCount])

  return data
}

export default useGoogleAnalytics
