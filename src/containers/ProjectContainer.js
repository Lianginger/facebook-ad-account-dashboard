import React, { useState } from 'react'
import { format } from '../utils/utils'
import './ProjectContainer.scss'

const ProjectContainer = ({ project, adAccount, gaViewIdMap, leadGAData }) => {
  const LEAD = 'lead'
  const [countdown, setCountdown] = useState('')

  const costPerAverageLead =
    adAccount.leadTotal > 0
      ? Number(adAccount.leadSpendTotal / adAccount.leadTotal).toFixed(1)
      : '-'

  if (!project.id) {
    return (
      <div className="project__ad-stats row">
        <div className="col-12 col-sm-4 ad-stats__list">
          <div className="ad-stats__key">名單數</div>
          <div className="ad-stats__value">
            {gaViewIdMap[LEAD] && leadGAData.total
              ? format(leadGAData.total).toNumber()
              : format(adAccount.leadTotal).toNumber()}
          </div>
        </div>
        <div className="col-12 col-sm-4 ad-stats__list">
          <div className="ad-stats__key">平均名單取得成本 CPL</div>
          <div className="ad-stats__value">
            {gaViewIdMap[LEAD] && leadGAData.total
              ? (adAccount.leadSpendTotal / leadGAData.total).toFixed(1)
              : costPerAverageLead}
          </div>
        </div>
        <div className="col-12 col-sm-4 ad-stats__list">
          <div className="ad-stats__key">總花費</div>
          <div className="ad-stats__value">
            {format(
              adAccount.leadSpendTotal + adAccount.preLaunchSpendTotal
            ).toDollar()}
          </div>
        </div>
      </div>
    )
  }

  const fundingCurrentNumber = Number(
    project.funding_current.replace(/\$ /g, '').replace(/,/g, '')
  )
  const fundingTargetNumber = Number(
    project.funding_target.replace(/\$ /g, '').replace(/,/g, '')
  )
  const goalPercentage = Math.floor(
    (fundingCurrentNumber / fundingTargetNumber) * 100
  )

  const fundRaisingSpendTotalPerFundingCurrent =
    adAccount.fundRaisingSpendTotal / fundingCurrentNumber

  const countdownInterval = setInterval(function () {
    const t = project.finished_at.split(/[- :]/)
    const countDownDate = new Date(t[0], t[1] - 1, t[2], t[3], t[4]).getTime()
    const now = new Date().getTime()
    const distance = countDownDate - now

    if (distance <= 0) {
      setCountdown(`已結束`)
      clearInterval(countdownInterval)
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setCountdown(`${days} 日 ${hours} 時 ${minutes} 分`)
    }
  }, 1000)

  return (
    <div className="row">
      <div className="col-12 col-sm-6 project__image">
        <div style={{ backgroundImage: `url(${project.og_image})` }}></div>
      </div>
      <div className="col-12 col-sm-6 project__ad-stats row">
        <div className="col-12 ad-stats__list">
          <div className="ad-stats__key">
            {/* TODO: 串接其他平台 */}
            <a
              href={'https://www.zeczec.com/projects/' + adAccount.projectId}
              target="blank"
            >
              {project.name}
            </a>
          </div>
          <div className="ad-stats__value">{project.funding_current}</div>
        </div>
        <div className="col-12 ad-stats__list">
          <div className="ad-stats__key">上線後廣告花費</div>
          <div className="ad-stats__value">
            {format(adAccount.fundRaisingSpendTotal).toDollar()}
          </div>
        </div>
        <div className="col-12 ad-stats__list">
          <div className="ad-stats__key">上線後廣告占比</div>
          <div className="ad-stats__value">
            {format(fundRaisingSpendTotalPerFundingCurrent).toPercentage()}
          </div>
        </div>
      </div>
      <div className="col-12 project__content">
        <div className="row project__content-info">
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">目標</div>
            <div className="list__value">{project.funding_target}</div>
          </div>
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">達成比例</div>
            <div className="list__value">
              {format(goalPercentage).toNumber()}%
            </div>
          </div>
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">贊助人數</div>
            <div className="list__value">{project.sponsor_count}</div>
          </div>
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">時程</div>
            <div className="list__value">
              {project.started_at} ~ {project.finished_at}
            </div>
          </div>
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">倒數</div>
            <div className="list__value">{countdown}</div>
          </div>
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">名單數</div>
            <div className="list__value">
              {gaViewIdMap[LEAD] && leadGAData.total
                ? format(leadGAData.total).toNumber()
                : format(adAccount.leadTotal).toNumber()}
            </div>
          </div>
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">平均 CPL</div>
            <div className="list__value">{costPerAverageLead}</div>
          </div>
          <div className="col-12 col-sm-6 project__content-info-list">
            <div className="list__key">前測/預熱總花費</div>
            <div className="list__value">
              {format(adAccount.leadSpendTotal).toDollar()}
              {' / '}
              {format(adAccount.preLaunchSpendTotal).toDollar()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectContainer
