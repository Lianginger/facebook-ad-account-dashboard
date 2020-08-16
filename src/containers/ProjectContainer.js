import React from 'react'
import { format } from '../utils/utils'
import './ProjectContainer.scss'

const ProjectContainer = ({ project, adAccount }) => {
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

  return (
    <div className='row'>
      <div className='col-12 col-sm-6 col-lg-4 project__image'>
        <div style={{ backgroundImage: `url(${project.og_image})` }}></div>
      </div>
      <div className='col-12 col-sm-6 col-lg-4 project__content'>
        <div className='project__content-title'>
          {/* TODO: 串接其他平台 */}
          <a
            href={'https://www.zeczec.com/projects/' + adAccount.projectId}
            target='blank'
          >
            {project.name}
          </a>
        </div>
        <h2 className='project__content-funding-current'>
          {project.funding_current}
        </h2>
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
        </div>
      </div>
      <div className='col-12 col-lg-4 project__ad-stats'>
        <div className='ad-stats__list'>
          <div className='ad-stats__key'>平均 CPL</div>
          <div className='ad-stats__value'>{costPerAverageLead}</div>
        </div>
        <div className='ad-stats__list'>
          <div className='ad-stats__key'>花費</div>
          <div className='ad-stats__value'>{totalSpend}</div>
        </div>
      </div>
    </div>
  )
}

export default ProjectContainer
