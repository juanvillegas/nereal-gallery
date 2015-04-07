<?php

class NerealGallery {


	protected static $error_no_posts_available = 'No posts available to use in the shortcode. Upload some attachments or specify "posts" attribute.';
	protected static $error_no_post_available = 'No post_id available to shortcode. Is this single()?';

	protected static $instance = false;
	// trailing slashed path to assets directory
	protected static $assets_path = 'assets/';
	protected static $assets_url = 'assets/';

	function __construct() {
		add_shortcode('nereal_gallery', array($this, 'handle_add_shortcode'));
		add_action('wp_enqueue_scripts', array($this, 'handle_wp_enqueue_scripts'));
	}

	/**
	 * Singleton handler (entry point)
	 * @return NerealGallery instance
	 */
	public static function instance() {
		if (static::$instance === false) {
			static::$instance = new NerealGallery();
		}

		return static::$instance;
	}

	/**
	 * Sets the assets (js, img) path. Useful when loading directly (not as a plugin)
	 * @param string $path trailing slashed path to assets directory
	 */
	public static function set_assets_path($path) {
		static::$assets_path = $path;
	}

	public static function set_assets_url($url) {
		static::$assets_url = $url;
	}

	public function handle_add_shortcode($atts) {
		$atts = shortcode_atts(array(
			'posts' => false, // array with WP_Post's ID of type "attachment" to use in the gallery
			'post_id' => false, // WP_Post ID,
			'plugin_id' => uniqid('nereal-'),
			'image_size' => 'full' // WP_Post ID
		), $atts);

		if ($atts['post_id'] === false) {
			// no post provided. default => use current, if any
			if (is_single()) {
				$atts['post_id'] = get_the_ID();
			} else {
				return static::$error_no_post_available;
			}
		}

		if ($atts['posts'] === false) {
			// no custom photos provided, default => get from post
			$children_attachments = get_attached_media('image', $atts['post_id']);

			if (count($children_attachments) == 0) {
				return static::$error_no_posts_available;
			} else {
				$atts['posts'] = array();
				foreach ($children_attachments as $attachment) {
					$atts['posts'][] = $attachment->ID;
				}
			}
		} else {
			$atts['posts'] = explode(',', $atts['posts']);
		}

		return $this->render($atts);
	}

	/**
	 * Renders a gallery.
	 *
	 * @param array $atts {
	 *   @type array $posts array of post ids
	 *   @type int $post_id post id of the current post (if single), or the post for which we are rendering the gallery
	 *   @type string $image_size optional. the image size to use, or "false" to use the full image. defaults to "full"
	 *   @type string $plugin_id optional id to assign to the gallery container
	 *   @type array $plugin_class optional array of classes to assign to the gallery container
	 * }
	 *
	 * @return string
	 */
	public function render($atts) {
		$images = array();

		$atts = $this->fill_atts_defaults($atts);

		// 1. fetch images
		$attachments_ids = $atts['posts'];
		foreach ($attachments_ids as $attachment_id) {
			$image = wp_get_attachment_image_src($attachment_id, $atts['image_size'], false);

			if (is_array($image)) {
				$images[] = $image;
			}
		}

		$atts['posts'] = $images;

		// 2. display
		ob_start();
		require(__DIR__ . '/views/gallery.php');
		$buffy = ob_get_contents();
		ob_end_clean();

		return $buffy;
	}

	public function handle_wp_enqueue_scripts(){
		wp_enqueue_script('jquery');

		wp_register_script('nereal_gallery_script', static::$assets_url . 'js/gallery.js');
		wp_enqueue_script('nereal_gallery_script');

		wp_register_style('nereal_gallery_css', static::$assets_url . 'css/gallery.css');
		wp_enqueue_style('nereal_gallery_css');
	}

	private function fill_atts_defaults($atts) {
		$defaults = array(
			'posts' => array(),
			'post_id' => get_the_ID(),
			'image_size' => 'full',
			'plugin_id' => uniqid('nereal-'),
			'plugin_class' => array()
		);
		return array_merge($defaults, $atts);
	}

	// -------------------------
	// Utility methods
	// -------------------------
	// To be used for templating (see views/ folder)
	// -------------------------

	public static function the_orientation( $width, $height ) {
		echo static::get_the_orientation($width, $height);
	}

	private static function get_the_orientation( $width, $height ) {
		if ($width > $height) {
			return 'landscape';
		} else {
			return 'portrait';
		}
	}

}

NerealGallery::instance();