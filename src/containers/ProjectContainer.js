import React, { useState } from 'react'
import { format } from '../utils/utils'
import './ProjectContainer.scss'

const ProjectContainer = ({ project, adAccount }) => {
  const [countdown, setCountdown] = useState('')
  if (!project.id) {
    return null
  }

  const fundingCurrentNumber = Number(
    project.funding_current.replace(/NTD /g, '').replace(/,/g, '')
  )
  const fundingTargetNumber = Number(
    project.funding_target.replace(/NTD /g, '').replace(/,/g, '')
  )
  const goalPercentage = Math.floor(
    (fundingCurrentNumber / fundingTargetNumber) * 100
  )
  const costPerAverageLead = Number(
    adAccount.leadSpendTotal / adAccount.leadTotal
  ).toFixed(1)
  const totalSpend = format(
    adAccount.leadSpendTotal +
      adAccount.preLaunchSpendTotal +
      adAccount.fundRaisingSpendTotal
  ).toDollar()
  const totalSpendPerFundingCurrent =
    (adAccount.leadSpendTotal +
      adAccount.preLaunchSpendTotal +
      adAccount.fundRaisingSpendTotal) /
    fundingCurrentNumber

  const countdownInterval = setInterval(function () {
    const countDownDate = new Date(project.finished_at).getTime()
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
    <div className='row'>
      <div className='col-12 col-sm-6 col-lg-4 project__image'>
        <div style={{ backgroundImage: `url(${project.og_image})` }}></div>
      </div>
      <div className='col-12 col-sm-6 col-lg-4 project__ad-stats row'>
        <div className='col-12 ad-stats__list'>
          <div className='ad-stats__key'>
            {/* TODO: 串接其他平台 */}
            <a
              href={'https://www.zeczec.com/projects/' + adAccount.projectId}
              target='blank'
            >
              {project.name}
            </a>
          </div>
          <div className='ad-stats__value'>{project.funding_current}</div>
        </div>
        <div className='col-12 ad-stats__list'>
          <div className='ad-stats__key'>廣告花費</div>
          <div className='ad-stats__value'>{totalSpend}</div>
        </div>
        <div className='col-12 ad-stats__list'>
          <div className='ad-stats__key'>廣告占比</div>
          <div className='ad-stats__value'>
            {format(totalSpendPerFundingCurrent).toPercentage()}
          </div>
        </div>
      </div>
      <div className='col-12 col-sm-6 col-lg-4 project__content'>
        <div className='project__content-info'>
          <div className='project__content-info-list'>
            <div className='list__key'>目標</div>
            <div className='list__value'>{project.funding_target}</div>
          </div>
          <div className='project__content-info-list'>
            <div className='list__key'>達成比例</div>
            <div className='list__value'>
              {format(goalPercentage).toNumber()}%
            </div>
          </div>
          <div className='project__content-info-list'>
            <div className='list__key'>贊助人數</div>
            <div className='list__value'>{project.sponsor_count}</div>
          </div>
          <div className='project__content-info-list'>
            <div className='list__key'>時程</div>
            <div className='list__value'>
              {project.started_at} ~ {project.finished_at}
            </div>
          </div>
          <div className='project__content-info-list'>
            <div className='list__key'>倒數</div>
            <div className='list__value'>{countdown}</div>
          </div>
          <div className='project__content-info-list'>
            <div className='list__key'>平均 CPL</div>
            <div className='list__value'>{costPerAverageLead}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectContainer
