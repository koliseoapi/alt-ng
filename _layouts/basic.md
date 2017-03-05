<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/css/styles.css">

  <title>{% if page.title %}{{ page.title }}{% else %}{{ site.title }}{% endif %}</title>
  <meta name="description" content="{{ page.description }}">
  <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon">
  <link rel="icon" href="/img/favicon.ico" type="image/x-icon">

  <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-3159223-6', 'auto');
    ga('send', 'pageview');

  </script>
</head>
<body>
  {% include header.md %}
    {{ content }}
  {% include footer.md %}
</body>
</html>
