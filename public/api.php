<?php
/**
 * MD. Shinha Sarder - Official Backend API (PHP)
 * Provides RESTful endpoints for profile data, technology stack, skills, and status.
 * Compatible with PHP 7.4+, 8.0+, 8.1+, 8.2+, 8.3+
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

$action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : 'info';

$profile = [
    'name' => 'MD. Shinha Sarder',
    'title' => 'Engineer, Developer, Entrepreneur & Content Creator',
    'born' => '5 November 2004',
    'birth_place' => 'Shirgati Village, Aichgati Union, Khulna, Bangladesh',
    'nationality' => 'Bangladeshi',
    'organizations' => [
        'IT Tech BD' => 'Founder & CEO',
        'Biostar TV World' => 'Founder & CEO'
    ],
    'education' => [
        'university' => 'Northern University of Business and Technology, Khulna (CSE)',
        'school' => 'Khulna Zilla School'
    ],
    'website' => 'https://mdshinhasarder.com',
    'email' => 'Shinhasarder2343@gmail.com',
    'whatsapp' => '+880 1576-716992',
    'socials' => [
        'facebook' => 'https://www.facebook.com/md.shinha.sarder',
        'twitter' => 'https://x.com/mdshinhasarder',
        'youtube' => 'https://www.youtube.com/@MD-Shinha-Sarder',
        'instagram' => 'https://www.instagram.com/md_shinha_sarder',
        'linkedin' => 'https://www.linkedin.com/in/md-shinha-sarder/',
        'github' => 'https://github.com/md-shinha-sarder'
    ]
];

$techStack = [
    'framework' => 'Next.js',
    'programming_languages' => ['Python', 'Node.js', 'PHP', 'JavaScript'],
    'database' => 'PostgreSQL (Supabase)',
    'styling' => 'Tailwind CSS',
    'deployment' => ['Cloudflare Pages', 'Vercel', 'Node.js Server', 'PHP Server'],
    'version' => '2.5.0'
];

$skills = [
    'core_languages' => [
        ['name' => 'Python', 'level' => 'Advanced', 'percent' => 95, 'focus' => 'Automation, AI, Web Scraping, Backend Scripts'],
        ['name' => 'Node.js', 'level' => 'Advanced', 'percent' => 92, 'focus' => 'Server APIs, Express, Real-Time Architecture'],
        ['name' => 'PHP', 'level' => 'Advanced', 'percent' => 88, 'focus' => 'REST APIs, CMS Integration, Dynamic Server Scripts'],
        ['name' => 'JavaScript', 'level' => 'Advanced', 'percent' => 90, 'focus' => 'Modern ES6+, Async, DOM Manipulation']
    ],
    'frameworks' => [
        ['name' => 'Next.js', 'level' => 'Expert', 'percent' => 95, 'focus' => 'App Router, Full-Stack Architecture, SSR/SSG'],
        ['name' => 'React', 'level' => 'Expert', 'percent' => 92, 'focus' => 'Component Architecture, Hooks, State Management'],
        ['name' => 'Tailwind CSS', 'level' => 'Expert', 'percent' => 92, 'focus' => 'Responsive Design, Modern UI/UX']
    ],
    'database_cloud' => [
        ['name' => 'PostgreSQL & Supabase', 'level' => 'Advanced', 'percent' => 90, 'focus' => 'Relational DB, RLS, Edge Functions, SQL'],
        ['name' => 'MySQL / SQL', 'level' => 'Proficient', 'percent' => 85, 'focus' => 'Queries, Schema Optimization, Relational Models']
    ]
];

switch ($action) {
    case 'ping':
    case 'health':
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            'php_version' => PHP_VERSION,
            'server_software' => isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : 'PHP Builtin/CGI'
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        break;

    case 'profile':
        echo json_encode([
            'success' => true,
            'data' => $profile
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        break;

    case 'skills':
        echo json_encode([
            'success' => true,
            'data' => $skills
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        break;

    case 'tech':
    case 'stack':
        echo json_encode([
            'success' => true,
            'data' => $techStack
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        break;

    case 'info':
    default:
        echo json_encode([
            'success' => true,
            'application' => 'MD. Shinha Sarder Portfolio CMS API',
            'author' => 'MD. Shinha Sarder',
            'framework' => 'Next.js',
            'languages' => ['Python', 'Node.js', 'PHP'],
            'profile' => $profile,
            'tech_stack' => $techStack,
            'endpoints' => [
                '?action=info' => 'System & Profile Overview',
                '?action=profile' => 'Biographical Details',
                '?action=skills' => 'Categorized Skills & Proficiency',
                '?action=stack' => 'Technologies and Frameworks',
                '?action=health' => 'API Health & Server Info'
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        break;
}
