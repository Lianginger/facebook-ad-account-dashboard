import React from 'react'
import './Switch.css'

const Switch = ({ labelFor, isOn, handleToggle, onColor }) => {
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
      </div>
    </>
  )
}

export default Switch
