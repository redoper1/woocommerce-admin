/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import './style.scss';
import CustomizableDashboard from './customizable';
import ProfileWizard from './profile-wizard';
import withSelect from 'wc-api/with-select';
import { isOnboardingEnabled } from 'dashboard/utils';
import { withSettingsHydration, withPluginsHydration } from '@woocommerce/data';

let PossiblyHydratedProfileWizard = ProfileWizard;

if (
	window.wcSettings.preloadSettings &&
	window.wcSettings.preloadSettings.general
) {
	PossiblyHydratedProfileWizard = withSettingsHydration( 'general', {
		general: window.wcSettings.preloadSettings.general,
	} )( PossiblyHydratedProfileWizard );
}

if ( window.wcSettings.plugins ) {
	PossiblyHydratedProfileWizard = withPluginsHydration(
		{
			...window.wcSettings.plugins,
			jetpackStatus: window.wcSettings.dataEndpoints.jetpackStatus,
		}
	)( PossiblyHydratedProfileWizard );
}

class Dashboard extends Component {
	render() {
		const { path, profileItems, query } = this.props;

		if ( isOnboardingEnabled() && ! profileItems.completed ) {
			return <PossiblyHydratedProfileWizard query={ query } />;
		}

		if ( window.wcAdminFeatures[ 'analytics-dashboard/customizable' ] ) {
			return <CustomizableDashboard query={ query } path={ path } />;
		}

		return null;
	}
}

export default compose(
	withSelect( ( select ) => {
		if ( ! isOnboardingEnabled() ) {
			return;
		}

		const { getProfileItems } = select( 'wc-api' );
		const profileItems = getProfileItems();

		return { profileItems };
	} )
)( Dashboard );
