<?php
/**
 * WooCommerce Navigation
 * NOTE: DO NOT edit this file in WooCommerce core, this is generated from woocommerce-admin.
 *
 * @package Woocommerce Admin
 */

namespace Automattic\WooCommerce\Admin\Features;

/**
 * Contains logic for the WooCommerce Navigation.
 */
class Navigation {
	/**
	 * Class instance.
	 *
	 * @var Navigation instance
	 */
	protected static $instance = null;

	/**
	 * Array index of menu title.
	 *
	 * @var int
	 */
	const TITLE = 0;

	/**
	 * Array index of menu capability.
	 *
	 * @var int
	 */
	const CAPABILITY = 1;

	/**
	 * Array index of menu callback.
	 *
	 * @var int
	 */
	const CALLBACK = 2;

	/**
	 * Array index of menu CSS class string.
	 *
	 * @var int
	 */
	const CSS_CLASSES = 4;

	/**
	 * Array index of menu handle.
	 *
	 * @var int
	 */
	const HANDLE = 5;

	/**
	 * Store related capabilities.
	 *
	 * @var array
	 */
	protected $store_capabilities = array(
		'manage_woocommerce',
		'view_woocommerce_reports',
	);

	/**
	 * Menu items that are permanently visible.
	 *
	 * @var array
	 */
	protected $permanent_items = array(
		'menu-dashboard',
		'toplevel_page_woocommerce',
	);

	/**
	 * Store related post types.
	 *
	 * @var array
	 */
	protected $post_types = array(
		'bookable_resource',
		'event_ticket',
		'product',
		'shop_coupon',
		'shop_order',
		'shop_subscription',
		'wc_booking',
		'wc_membership_plan',
		'wc_pickup_location',
		'wc_product_tab',
		'wc_user_membership',
		'wc_voucher',
		'wc_zapier_feed',
		'wishlist',
	);

	/**
	 * Store top level categories.
	 *
	 * @var array
	 */
	protected $categories = array();

	/**
	 * Store related menu items.
	 *
	 * @var array
	 */
	protected $store_menu = array();

	/**
	 * Screen IDs of registered pages.
	 *
	 * @var array
	 */
	protected static $screen_ids = array();

	/**
	 * Map of all top level menu items.
	 *
	 * @return array
	 */
	public function get_menu_item_map() {
		$map = array(
			'edit.php?post_type=product' => array(
				'slug'  => 'product',
				'order' => 10,
			),
			'wc-admin&path=/analytics/revenue' => array(
				'slug'  => 'analytics',
				'order' => 10,
			),
			'wc-admin&path=/marketing'   => array(
				'slug'  => 'marketing',
				'order' => 10,
			),
			'edit.php?post_type=product' => array(
				'slug'  => 'products',
				'order' => 10,
			),
			'plugins.php' => array(
				'slug'  => 'plugins',
				'order' => 10,
			),
			'mailchimp-woocommerce'      => array(
				'category' => 'marketing',
				'order'    => 20,
			),
		);

		return apply_filters( 'woocommerce_navigation_menu_item_map', $map );
	}

	/**
	 * Check if we're on a WooCommerce page
	 *
	 * @return bool
	 */
	public function is_woocommerce_page() {
		global $pagenow, $plugin_page;

		// Get post type if on a post screen.
		$post_type = '';
		if ( in_array( $pagenow, array( 'edit.php', 'post.php', 'post-new.php' ), true ) ) {
			if ( isset( $_GET['post'] ) ) { // phpcs:ignore CSRF ok.
				$post_type = get_post_type( (int) $_GET['post'] ); // phpcs:ignore CSRF ok.
			} elseif ( isset( $_GET['post_type'] ) ) { // phpcs:ignore CSRF ok.
				$post_type = sanitize_text_field( wp_unslash( $_GET['post_type'] ) ); // phpcs:ignore CSRF ok.
			}
		}
		$post_types = apply_filters( 'woocommerce_navigation_post_types', $this->post_types );

		// Get current screen ID.
		$current_screen = get_current_screen();
		$screen_ids     = apply_filters( 'woocommerce_navigation_screen_ids', self::$screen_ids );

		if (
			in_array( $post_type, $post_types, true ) ||
			in_array( $current_screen->id, self::$screen_ids, true )
		) {
			return true;
		}

		return false;
	}

	/**
	 * Map of all submenu items.
	 *
	 * @var array
	 */
	public function get_submenu_item_map() {
		$map = array(
			'wc-admin' => array(
				'slug'  => 'dashboard',
				'order' => 10,
			),
			'edit.php?post_type=shop_order' => array(
				'slug'  => 'orders',
				'order' => 10,
			),
			'wc-admin&path=/customers' => array(
				'slug'  => 'customers',
				'order' => 10,
			),
			'wc-settings'              => array(
				'slug'  => 'settings',
				'order' => 10,
			),
			'plugins.php' => array(
				'category'  => 'plugins',
				'order' => 10,
			),
		);

		return apply_filters( 'woocommerce_navigation_submenu_item_map', $map );
	}

	/**
	 * Get class instance.
	 */
	final public static function instance() {
		if ( ! static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	/**
	 * Constructor
	 */
	public function __construct() {
		if ( is_admin() && ! apply_filters( 'woocommerce_use_legacy_navigation', false ) ) {
			add_filter( 'add_menu_classes', array( $this, 'get_menu_items' ) );
			add_filter( 'add_menu_classes', array( $this, 'add_menu_settings' ), 20 );
		}
	}

	/**
	 * Update dashboard menu for site or store dashboard.
	 *
	 * @param array $menu Top level dashboard menu items.
	 * @return array
	 */
	public function update_navigation( $menu ) {
		global $pagenow, $plugin_page;

		// Get post type if adding/editing a post.
		$typenow = '';
		if ( in_array( $pagenow, array( 'edit.php', 'post.php', 'post-new.php' ), true ) ) {
			if ( isset( $_GET['post'] ) ) { // phpcs:ignore CSRF ok.
				$typenow = get_post_type( (int) $_GET['post'] ); // phpcs:ignore CSRF ok.
			} elseif ( isset( $_GET['post_type'] ) ) { // phpcs:ignore CSRF ok.
				$typenow = sanitize_text_field( wp_unslash( $_GET['post_type'] ) ); // phpcs:ignore CSRF ok.
			}
		}

		// Add editing store post types to capabilities list.
		$store_capabilities = $this->store_capabilities;
		foreach ( $this->post_types as $post_type ) {
			$store_capabilities[] = 'edit_' . $post_type . 's';
		}
		$store_capabilities = apply_filters( 'woocommerce_navigation_store_capabilities', $store_capabilities );
		$permanent_items    = apply_filters( 'woocommerce_navigation_permanent_items', $this->permanent_items );
		$post_types         = apply_filters( 'woocommerce_navigation_post_types', $this->post_types );

		if ( ! empty( $plugin_page ) ) {
			$plugin_pages    = apply_filters( 'woocommerce_navigation_plugin_pages', $this->plugin_pages );
			$plugin_prefixes = [];
			foreach ( $plugin_pages as $prefix ) {
				$plugin_prefixes[] = 'toplevel_page_' . $prefix;
			}
		}

		$managing_store = false;
		foreach ( $menu as $index => $item ) {
			// Skip separators.
			if ( ! isset( $item[ self::HANDLE ] ) ) {
				continue;
			}
			// Only check menu items with store capabilities to determine whether we are on a store screen.
			if ( in_array( $item[ self::CAPABILITY ], $store_capabilities, true ) ) {
				// Is it a store post type.
				if ( $typenow && in_array( $typenow, $post_types, true ) ) {
					$managing_store = true;
					break;
				}

				// Is it a store plugin page.
				if ( ! empty( $plugin_page ) ) {
					foreach ( $plugin_prefixes as $plugin_prefix ) {
						if ( 0 === strpos( $item[ self::HANDLE ], $plugin_prefix ) ) {
							$managing_store = true;
							break 2;
						}
					}
				}
			}
		}

		foreach ( $menu as $index => $item ) {
			// Skip separators.
			if ( ! isset( $item[ self::HANDLE ] ) ) {
				continue;
			}
			// Handle permanent pages.
			if ( in_array( $item[ self::HANDLE ], $permanent_items, true ) ) {
				if ( $managing_store ) {
					$this->store_menu[] = $item;
				}
				continue;
			}

			$is_store_page = in_array( $item[ self::CAPABILITY ], $store_capabilities, true );
			// Save the menu item if managing store and it's a store page.
			if ( $is_store_page && $managing_store ) {
				$this->store_menu[] = $item;
			}
			// Hide menu items if they are store context.
			if ( $is_store_page ) {
				$menu[ $index ][ self::CSS_CLASSES ] .= ' hide-if-js';
			}
		}

		// @todo Add filter to body class when managing store to add the folded class.
		return $menu;
	}

	/**
	 * Convert a WordPress menu callback to a URL.
	 *
	 * @param string $callback Menu callback.
	 * @return string
	 */
	protected function get_callback_url( $callback ) {
		$pos  = strpos( $callback, '?' );
		$file = $pos > 0 ? substr( $callback, 0, $pos ) : $callback;
		if ( file_exists( ABSPATH . "/wp-admin/$file" ) ) {
			return $callback;
		}
		return 'admin.php?page=' . $callback;
	}

	/**
	 * Get the menu items to use from the existing registered menu items.
	 *
	 * @param array $menu Top level dashboard menu items.
	 * @return array
	 */
	public function get_menu_items( $menu ) {
		global $submenu;

		foreach ( $menu as $index => $item ) {
			$menu_item_map = $this->get_menu_item_map();
			if ( isset( $menu_item_map[ $item[ self::CALLBACK ] ] ) ) {
				$this->map_menu_item( $item, $menu_item_map );
				unset( $menu[ $index ] );
				self::$screen_ids[] = get_plugin_page_hookname( $item[ self::CALLBACK ], null );
			}
		}

		foreach ( $submenu as $parent_key => $parent_item ) {
			foreach ( $parent_item as $item ) {
				$submenu_item_map = $this->get_submenu_item_map();
				if ( isset( $submenu_item_map[ $item[ self::CALLBACK ] ] ) ) {
					$this->map_menu_item( $item, $submenu_item_map );
					unset( $menu[ $index ] );
					self::$screen_ids[] = get_plugin_page_hookname( $item[ self::CALLBACK ], $parent_key );
				}
			}
		}
		// @todo If is a WooCommerce related page by capability or top level item, add to 'Store' category by default.

		return $menu;
	}

	/**
	 * Map old menu item to new menu.
	 *
	 * @param array $item Menu item.
	 * @param array $map  Map of old items to new.
	 */
	public function map_menu_item( $item, $map ) {
		if (
			isset( $map[ $item[ self::CALLBACK ] ]['slug'] ) &&
			! isset( $map[ $item[ self::CALLBACK ] ]['category'] )
		) {
			// No category so set so assume this is a top-level category.
			$category_slug      = $map[ $item[ self::CALLBACK ] ]['slug'];
			$this->categories[] = array(
				'slug'  => $category_slug,
				'url'   => $this->get_callback_url( $item[ self::CALLBACK ] ),
				'title' => $item[ self::TITLE ],
			);
		} else {
			$category                        = $map[ $item[ self::CALLBACK ] ]['category'];
			$this->store_menu[ $category ][] = array(
				'slug'  => $item[ self::CALLBACK ],
				'url'   => $this->get_callback_url( $item[ self::CALLBACK ] ),
				'title' => $item[ self::TITLE ],
			);
		}
	}

	/**
	 * Add the menu to the page output.
	 *
	 * @param array $menu Top level dashboard menu items.
	 * @return array
	 */
	public function add_menu_settings( $menu ) {
		global $submenu, $parent_file, $typenow, $self;

		$categories = $this->categories;
		foreach ( $categories as $index => $category ) {
			$categories[ $index ]['children'] = isset( $this->store_menu[ $category['slug'] ] )
				? $this->store_menu[ $category['slug'] ]
				: array();
		}

		$data_registry = \Automattic\WooCommerce\Blocks\Package::container()->get(
			\Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry::class
		);

		$data_registry->add( 'wcNavigation', $categories );

		return $menu;
	}
}
