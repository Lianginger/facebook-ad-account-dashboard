import { call, put, takeLatest } from 'redux-saga/effects'
import { setUser, fetchUserAndAdAccountsAsync } from './userSlice'
import { setAdAccounts } from '../adAccounts/adAccountsSlice'

export function* fetchUserAndAdAccountsAsyncSaga({ payload }) {
  try {
    yield put(setUser({ isLoading: true }))
    yield put(setAdAccounts({ isLoading: true }))

    const response = yield call(() => {
      return new Promise((resolve) => {
        window.FB.api(
          '/me?fields=name,picture{url},adaccounts.limit(1000){age,name,amount_spent,campaigns.limit(1000){status,name}}',
          function (res) {
            resolve(res)
          }
        )
      })
    })

    if(response.error) {
      yield put(setUser({isNoAuth: true}))
      yield put(setAdAccounts({data: []}))
    } else {
      const userData = {
        name: response.name,
        pictureURL: response.picture.data.url,
        isLogin: true,
      }
      const adAccounts = {
        data: formatAdAccounts(response.adaccounts.data),
      }
  
      yield put(setUser(userData))
      yield put(setAdAccounts(adAccounts))
    }

    yield put(setUser({ isLoading: false }))
    yield put(setAdAccounts({ isLoading: false }))
  } catch (error) {
    yield put(setUser({ isLoading: false }))
    console.log(error)
  }
}

function formatAdAccounts(AdAccounts) {
  let sortedAdAccountsData = AdAccounts.sort((a, b) => a.age - b.age)

  // 遍歷廣告活動狀態，在廣告帳戶物件加上 adAccountLive 屬性
  sortedAdAccountsData = sortedAdAccountsData.map((adAccount) => {
    adAccount.adAccountLive = false
    adAccount.campaignStatus = { name: '', value: 0 }

    if (adAccount.campaigns) {
      adAccount.campaigns.data.forEach((adCampaign) => {
        if (adCampaign.status === 'ACTIVE') {
          adAccount.adAccountLive = true
        }
        adAccount.campaignStatus = handleAdCampaignStatus(
          adAccount.campaignStatus,
          adCampaign.name
        )
      })
    }
    return adAccount
  })

  return sortedAdAccountsData
}

function handleAdCampaignStatus(originalStatus, adCampaignName) {
  // 狀態變成數字來比大小
  // 較大的為現在的狀態
  const newStatus = getAdCampaignStatus(adCampaignName)
  return newStatus.value > originalStatus.value ? newStatus : originalStatus
}

function getAdCampaignStatus(adCampaignName) {
  return adCampaignName.includes('上線')
    ? { name: '上線', value: 3 }
    : adCampaignName.includes('預熱')
    ? { name: '預熱', value: 2 }
    : adCampaignName.includes('前測')
    ? { name: '前測', value: 1 }
    : { name: '', value: 0 }
}

export default function* productSaga() {
  yield takeLatest(fetchUserAndAdAccountsAsync, fetchUserAndAdAccountsAsyncSaga)
}
