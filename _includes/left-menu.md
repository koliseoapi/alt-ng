<nav class="menu">
  <span class="menu-heading">{{page.categories[0]}}</span>
{% for node in site.pages %}
  {% if page.categories[0] == node.categories[0] %}
    <a class="menu-item {% if page.url == node.url %}selected{% endif %}" href="{{node.url}}">{{node.title}}</a>
  {% endif %}
{% endfor %}
</nav>