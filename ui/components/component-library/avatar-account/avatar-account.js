import React from 'react';
import classnames from 'classnames';
import Jazzicon from '../../ui/jazzicon/jazzicon.component';
import BlockieIdenticon from '../../ui/identicon/blockieIdenticon/blockieIdenticon.component';
import PropTypes from 'prop-types';
import { BaseAvatar } from '../base-avatar';

import { SIZES } from '../../../helpers/constants/design-system';

export const diameters = {
  xs: '16',
  sm: '24',
  md: '32',
  lg: '40',
  xl: '48',
};

export const avatarAccountTypes = ["Jazzicon", "BlockieIdenticon"]

const getStyles = (diameter) => ({
  height: diameter,
  width: diameter,
  borderRadius: diameter / 2,
});

export const AvatarAccount = ({
  size,
  address,
  className,
  avatarAccountType,
  ...props
}) => {
  return (
    <BaseAvatar
      size={size}
      className={classnames('avatar-account', className)}
      {...props}
    >
      {avatarAccountType === 'Jazzicon' ? (
        <Jazzicon address={address} style={getStyles(diameters[size])} />
      ) : (
        <BlockieIdenticon
          address={address}
          diameter={diameters[size]}
          borderRadius="50%"
        />
      )}
    </BaseAvatar>
  );
};

AvatarAccount.propTypes = {
  /**
   * The size of the AvatarAccount.
   * Possible values could be 'SIZES.XS', 'SIZES.SM', 'SIZES.MD', 'SIZES.LG', 'SIZES.XL'
   * Defaults to SIZES.MD
   */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /**
   * The type of the avatar to be rendered, it can render either a Jazzicon or a BlockIdenticon
   */
  avatarAccountType: PropTypes.oneOf(['Jazzicon', 'BlockieIdenticon']),
  /**
   * Address used for generating random image
   */
  address: PropTypes.string,
  /**
   * Add custom css class
   */
  className: PropTypes.string,
};
