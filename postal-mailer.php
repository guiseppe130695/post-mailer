<?php
/*
Plugin Name: Postal Mailer
Description: A step-by-step postal mailing system for WordPress
Version: 1.0.0
Author: Your Name
*/

if (!defined('ABSPATH')) {
    exit;
}

// Enqueue scripts and styles
function postal_mailer_enqueue_scripts() {
    wp_enqueue_style(
        'postal-mailer-styles',
        plugins_url('assets/css/styles.css', __FILE__),
        [],
        '1.0.0'
    );

    wp_enqueue_script(
        'postal-mailer-script',
        plugins_url('assets/js/postal-mailer.js', __FILE__),
        ['jquery'],
        '1.0.0',
        true
    );

    wp_localize_script('postal-mailer-script', 'postalMailerData', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('postal-mailer-nonce')
    ]);
}
add_action('wp_enqueue_scripts', 'postal_mailer_enqueue_scripts');

// Add the postal button to the footer
function postal_mailer_add_button() {
    include plugin_dir_path(__FILE__) . 'templates/button.php';
    include plugin_dir_path(__FILE__) . 'templates/popup.php';
}
add_action('wp_footer', 'postal_mailer_add_button');

// Ajax handler for form submission
function postal_mailer_submit() {
    check_ajax_referer('postal-mailer-nonce', 'nonce');

    $data = json_decode(file_get_contents('php://input'), true);
    
    $recipients = sanitize_text_field($data['recipients']);
    $message = sanitize_textarea_field($data['message']);
    $total_cost = floatval($data['totalCost']);

    // Here you would typically save to database or process the mailing request
    
    wp_send_json_success([
        'message' => 'Votre demande d\'envoi postal a été enregistrée avec succès.'
    ]);
}
add_action('wp_ajax_postal_mailer_submit', 'postal_mailer_submit');
add_action('wp_ajax_nopriv_postal_mailer_submit', 'postal_mailer_submit');