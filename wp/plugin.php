<?php
/*
Plugin Name: NerealGallery
Description: Optional wrapper to load the gallery as a plugin
Version: 1.0
Author: Team Handstand
Author URI: http://teamhandstand.com
*/

require_once('NerealGallery.php');

NerealGallery::set_assets_path(plugin_dir_path(__FILE__) . 'assets/');
NerealGallery::set_assets_url(plugin_dir_url(__FILE__) . 'assets/');
