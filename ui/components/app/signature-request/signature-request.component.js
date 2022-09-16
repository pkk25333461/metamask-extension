import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import LedgerInstructionField from '../ledger-instruction-field';
import { sanitizeMessage, getURLHostName } from '../../../helpers/utils/util';
import { EVENT } from '../../../../shared/constants/metametrics';
import { conversionUtil } from '../../../../shared/modules/conversion.utils';
import SiteOrigin from '../../ui/site-origin';
import Typography from '../../ui/typography/typography';
import {
  TYPOGRAPHY,
  FONT_WEIGHT,
} from '../../../helpers/constants/design-system';
import NetworkAccountBalanceHeader from '../network-account-balance-header';
import Footer from './signature-request-footer';
import Message from './signature-request-message';

export default class SignatureRequest extends PureComponent {
  static propTypes = {
    /**
     * The display content of transaction data
     */
    txData: PropTypes.object.isRequired,
    /**
     * The display content of sender account
     */
    fromAccount: PropTypes.shape({
      address: PropTypes.string.isRequired,
      balance: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
    /**
     * Check if the wallet is ledget wallet or not
     */
    isLedgerWallet: PropTypes.bool,
    /**
     * Handler for cancel button
     */
    cancel: PropTypes.func.isRequired,
    /**
     * Handler for sign button
     */
    sign: PropTypes.func.isRequired,
    /**
     * Whether the hardware wallet requires a connection disables the sign button if true.
     */
    hardwareWalletRequiresConnection: PropTypes.bool.isRequired,

    conversionRate: PropTypes.number,
    nativeCurrency: PropTypes.string,
    currentNetwork: PropTypes.string,
    subjectMetadata: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  state = {
    hasScrolledMessage: false,
  };

  setMessageRootRef(ref) {
    this.messageRootRef = ref;
  }

  formatWallet(wallet) {
    return `${wallet.slice(0, 8)}...${wallet.slice(
      wallet.length - 8,
      wallet.length,
    )}`;
  }

  renderHeader = () => {
    const { conversionRate, nativeCurrency, currentNetwork } = this.props;
    const {
      fromAccount: { address, balance, name },
    } = this.props;

    const balanceInBaseAsset = conversionUtil(balance, {
      fromNumericBase: 'hex',
      toNumericBase: 'dec',
      fromDenomination: 'WEI',
      numberOfDecimals: 6,
      conversionRate,
    });

    return (
      <div className="request-signature__account">
        <NetworkAccountBalanceHeader
          networkName={currentNetwork}
          accountName={name}
          accountBalance={balanceInBaseAsset}
          tokenName={nativeCurrency}
          accountAddress={address}
        />
      </div>
    );
  };

  render() {
    const {
      fromAccount,
      txData: {
        msgParams: { data, origin, version },
        type,
      },
      cancel,
      sign,
      isLedgerWallet,
      hardwareWalletRequiresConnection,
      txData,
      subjectMetadata,
    } = this.props;
    const { address: fromAddress } = fromAccount;
    const { message, domain = {}, primaryType, types } = JSON.parse(data);
    const { trackEvent } = this.context;

    const onSign = (event) => {
      sign(event);
      trackEvent({
        category: EVENT.CATEGORIES.TRANSACTIONS,
        event: 'Confirm',
        properties: {
          action: 'Sign Request',
          legacy_event: true,
          type,
          version,
        },
      });
    };

    const onCancel = (event) => {
      cancel(event);
      trackEvent({
        category: EVENT.CATEGORIES.TRANSACTIONS,
        event: 'Cancel',
        properties: {
          action: 'Sign Request',
          legacy_event: true,
          type,
          version,
        },
      });
    };

    const messageIsScrollable =
      this.messageRootRef?.scrollHeight > this.messageRootRef?.clientHeight;

    const targetSubjectMetadata = txData.msgParams.origin
      ? subjectMetadata?.[txData.msgParams.origin]
      : null;

    return (
      <div className="signature-request page-container">
        {this.renderHeader()}
        <div className="signature-request-content">
          <div className="signature-request__origin">
            <SiteOrigin
              siteOrigin={origin}
              iconSrc={targetSubjectMetadata?.iconUrl}
              iconName={getURLHostName(origin) || origin}
              chip
            />
          </div>

          <Typography
            className="signature-request__content__title"
            variant={TYPOGRAPHY.H3}
            fontWeight={FONT_WEIGHT.BOLD}
          >
            {this.context.t('sigRequest')}
          </Typography>
          <div className="signature-request-content__info--bolded">
            {domain.name}
          </div>
          <SiteOrigin
            className="signature-request-content__info"
            siteOrigin={origin}
          />
          <div className="signature-request-content__info">
            {this.formatWallet(fromAddress)}
          </div>
        </div>
        {isLedgerWallet ? (
          <div className="confirm-approve-content__ledger-instruction-wrapper">
            <LedgerInstructionField showDataInstruction />
          </div>
        ) : null}
        <Message
          data={sanitizeMessage(message, primaryType, types)}
          onMessageScrolled={() => this.setState({ hasScrolledMessage: true })}
          setMessageRootRef={this.setMessageRootRef.bind(this)}
          messageRootRef={this.messageRootRef}
          messageIsScrollable={messageIsScrollable}
        />
        <Footer
          cancelAction={onCancel}
          signAction={onSign}
          disabled={
            hardwareWalletRequiresConnection ||
            (messageIsScrollable && !this.state.hasScrolledMessage)
          }
        />
      </div>
    );
  }
}
