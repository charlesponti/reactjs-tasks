# sematic-nav

A HTML5 compliant nav bar solution

## Install

```
  bower install semantic-nav
```

## Back story

I've used just about every nav bar out there, from Bootstrap to Foundation to
Semantic UI and so on. I grew tired of the lack of semantic HTML5 element usage
and the mangled **`<div>` soup** that they come with which I cannot
stand. They also require you to attach a whole host of classes to the nested div
jungle they ask you to plop into your page that makes it extremely frustrating to
switch one css file out for another one. They also require you to use jQuery or
Zepto or whatever other JavaScript library along with their own 100+KB JavaScript
file to power the darn thing.

So, I made **semantic-nav**.

The whole point behind this is to use semantic HTML5 elements, concise CSS, and vanilla JS to make a modern and responsive navigation solution that provides a good user experience.

No, this will not work if you want to put 50 links and 10 drop-downs with nested drop-downs within nested drop-downs into your nav bar. If you're doing that, you need to read a book about usability instead of poking around the interwebs for  another framework.

I have also included an **AngularJS** directive you can use if that's your cup of tea.

## HTML

### `Semantic Nav`
```html
  <header class="site-header">
      <div class="hamburger menu" href="#"><i></i></div>
      <div class="logo">Semantic Nav</div>
  </header>

  <nav class="site-nav">
      <ul>
          <li><a href="#"> Link 1 </a></li>
          <li><a href="#"> Link 2 </a></li>
          <li><a href="#"> Link 3 </a></li>
      </ul>
  </nav>
```

### vs. `Bootstrap`
```html
<nav role="navigation" class="navbar navbar-default">
    <div class="navbar-header">
        <button type="button" data-target="#navbarCollapse" data-toggle="collapse" class="navbar-toggle">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
        <a href="#" class="navbar-brand">Bootstrap Nav</a>
    </div>
    <div id="navbarCollapse" class="collapse navbar-collapse">
        <ul class="nav navbar-nav">
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
        </ul>
    </div>
</nav>
```

## How It Looks

### Closed
![> 768px closed](/images/semantic-nav-closed.png)

### Open
![> 768px open](/images/semantic-nav-open.png)

**Enjoy**
