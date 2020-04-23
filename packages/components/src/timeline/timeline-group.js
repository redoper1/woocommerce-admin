/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import TimelineItem from './timeline-item';
import { sortByDateUsing } from './util';

const TimelineGroup = ( props ) => {
	const { group, className, orderBy } = props;
	const groupClassName = classnames(
		'woocommerce-timeline-group',
		className
	);
	const itemsToTimlineItem = ( item, itemIndex ) => {
		const itemKey = group.title + '-' + itemIndex;
		return <TimelineItem key={ itemKey } item={ item } />;
	};

	return (
		<li className={ groupClassName }>
			<p className={ 'woocommerce-timeline-group__title' }>
				{ group.title }
			</p>
			<ul>
				{ group.items
					.sort( sortByDateUsing( orderBy ) )
					.map( itemsToTimlineItem ) }
			</ul>
			<hr />
		</li>
	);
};

TimelineGroup.propTypes = {
	/**
	 * Additional CSS classes.
	 */
	className: PropTypes.string,
	/**
	 * The group to render.
	 */
	group: PropTypes.shape( {
		/**
		 * The group title.
		 */
		title: PropTypes.string,
		/**
		 * An array of list items.
		 */
		items: PropTypes.arrayOf(
			PropTypes.shape( {
				/**
				 * Timestamp (in seconds) for the timeline item.
				 */
				datetime: PropTypes.number.isRequired,
				/**
				 * Icon for the Timeline item.
				 */
				icon: PropTypes.element.isRequired,
				/**
				 * Headline displayed for the list item.
				 */
				headline: PropTypes.oneOfType( [
					PropTypes.element,
					PropTypes.string,
				] ).isRequired,
				/**
				 * Body displayed for the list item.
				 */
				body: PropTypes.arrayOf(
					PropTypes.oneOfType( [
						PropTypes.element,
						PropTypes.string,
					] )
				),
				/**
				 * Allows users to toggle the timestamp on or off.
				 */
				hideTimestamp: PropTypes.bool,
			} )
		).isRequired,
	} ).isRequired,
	/**
	 * Defines how items should be ordered.
	 */
	orderBy: PropTypes.oneOf( [ 'asc', 'desc' ] ),
};

TimelineGroup.defaultProps = {
	className: '',
	group: {
		title: '',
		items: [],
	},
	orderBy: 'desc',
};

export default TimelineGroup;
