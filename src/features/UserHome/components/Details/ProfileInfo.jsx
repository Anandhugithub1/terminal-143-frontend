import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { FaVenus } from 'react-icons/fa'
import { RxHeart } from 'react-icons/rx'

const genderMap = {
  M: 'Male',
  F: 'Female',
  TF: 'To Female',
  TM: 'To Male',
  OT: 'Others'
}

// Badge component
export const Badge = memo(({ icon, label, iconClass = 'text-gray-800' }) => (
  <span className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full text-xs font-medium">
    {React.cloneElement(icon, { className: iconClass })}
    <span className="text-gray-800">{label}</span>
  </span>
))

Badge.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  iconClass: PropTypes.string
}

const ProfileInfo = memo(({
  name,
  age,
  lastSeen,
  about,
  gender,
  distance,
  feedback
}) => {

  const likePercent = feedback?.likePercentage || 0

  const genderLabel = genderMap[gender] || gender

  return (
    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-transparent text-white">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{name}, {age}</h2>
          <p className="text-sm opacity-75">{lastSeen}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-2">

        <Badge
          icon={<FaVenus size={12} />}
          label={genderLabel}
        />

        {likePercent >= 50 && (
          <Badge
            icon={<RxHeart size={12} />}
            label={`${likePercent}%`}
            iconClass="text-green-600"
          />
        )}

      </div>

    </div>
  )
})

export default ProfileInfo

ProfileInfo.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lastSeen: PropTypes.string.isRequired,
  about: PropTypes.string,
  gender: PropTypes.string.isRequired,
  distance: PropTypes.string,
  feedback: PropTypes.shape({
    likePercentage: PropTypes.number
  })
}