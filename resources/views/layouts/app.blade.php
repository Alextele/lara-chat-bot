<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Чат ботик</title>
    <meta name="keywords" content="чат-бот, laravel, backpack, php, искусственный интеллект">
    <meta property="og:title" content="LaraChatBot — Чат-бот на Laravel с поддержкой Backpack">
    <meta name="description" content="Создай собственного чат-бота на Laravel с Backpack за 10 минут. Поддержка AI, удобная панель, чистый код.">
    <meta property="og:description" content="Чат-бот на Laravel с поддержкой AI. Установка за 10 минут. Панель управления на Backpack.">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="628">
    <meta property="og:site_name" content="Lara Chat Bot">
    <meta name="csrf-token" content="{{ csrf_token() }}">
{{--    <meta property="og:url" content="{{ $default_meta_settings['url'] }}">--}}
{{--    <meta property="og:image" content="{{ isset($image) ? $image : $default_meta_settings['image'] }}">--}}
{{--    <meta property="vk:image" content="{{ isset($image) ? $image : $default_meta_settings['image'] }}">--}}
{{--    <meta property="vk:image_share" content="{{ isset($image) ? $image : $default_meta_settings['image'] }}">--}}
{{--    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('favicons/apple-touch-icon.png')}}">--}}
{{--    <link rel="manifest" href="{{ asset('favicons/site.webmanifest')}}">--}}
{{--    <link rel="mask-icon" href="{{ asset('favicons/safari-pinned-tab.svg')}}">--}}
{{--    <meta name="apple-mobile-web-app-title" content="SPb RAS">--}}
{{--    <meta name="application-name" content="SPb RAS">--}}
{{--    <meta name="msapplication-TileColor" content="#003464">--}}
{{--    <meta name="theme-color" content="#ffffff">--}}
{{--    <meta property="og:type" content="website">--}}
{{--    <meta name="csrf-token" content="{{ csrf_token() }}">--}}
{{--    <meta name="apple-mobile-web-app-title" content="{{ $default_meta_settings['site_name'] }}">--}}
{{--    <meta name="application-name" content="{{ $default_meta_settings['site_name'] }}">--}}
{{--    <link rel="icon" type="image/svg+xml" href="{{ asset('favicons/favicon.svg')}}">--}}
{{--    <link rel="icon" type="image/png" href="{{ asset('favicons/favicon.png')}}">--}}
{{--    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('favicons/apple-touch-icon.png')}}">--}}

    <link rel="stylesheet" href="{{ asset('assets/css/main.css') }}">
</head>
<body>
<header class="header">
    @yield('header')
</header>
<div class="page">
    @yield('content')
</div>
<footer class="main-footer">
    @yield('footer')
</footer>
@stack('js')
</body>
</html>
