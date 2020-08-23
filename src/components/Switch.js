import React from 'react'
import './Switch.css'

const Switch = ({ labelFor, isOn, handleToggle, onColor, title }) => {
  return (
    <>
      <div className='switch-container'>
        <input
          checked={isOn}
          onChange={handleToggle}
          className='react-switch-checkbox'
          id={'react-switch-' + labelFor}
          type='checkbox'
        />
        <label
          style={{ background: isOn && onColor }}
          className='react-switch-label'
          htmlFor={'react-switch-' + labelFor}
        >
          <span className={`react-switch-button`} />
        </label>
        <span>只顯示活躍廣告帳戶</span>
      </div>
    </>
  )
}

export default Switch
