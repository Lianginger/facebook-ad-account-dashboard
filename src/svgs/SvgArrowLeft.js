import * as React from 'react'

function SvgArrowLeft(props) {
  return (
    <svg width={24} height={24} viewBox='0 0 24 24' fill='none' {...props}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.707 5.707a1 1 0 00-1.414-1.414l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414-1.414L7.414 13H19a1 1 0 100-2H7.414l5.293-5.293z'
      />
    </svg>
  )
}

export default SvgArrowLeft
