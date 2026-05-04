export const packagingShopTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{SHOP_TITLE}} | {{BRAND_NAME}}</title>
<meta name="description" content="{{BRAND_TAGLINE}}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<style>
*{font-family:'Inter',sans-serif;color:#1D1D1B}
body{background:#fff}
.cat-pill{cursor:pointer;white-space:nowrap;transition:all .15s ease}
.cat-pill.active{background:{{PRIMARY_COLOR}};color:#fff!important;border-color:{{PRIMARY_COLOR}}!important}
.cat-pill:not(.active):hover{border-color:#9ca3af}
.product-card{transition:transform .2s ease,box-shadow .2s ease}
.product-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.09)}
.product-card.filtered-out{display:none!important}
.add-overlay{opacity:0;transform:translateY(5px);transition:opacity .2s ease,transform .2s ease;pointer-events:none}
.product-card:hover .add-overlay{opacity:1;transform:translateY(0);pointer-events:auto}
.badge:empty{display:none}
.size-pill{cursor:pointer;transition:all .12s ease;display:inline-flex;align-items:center;padding:2px 9px;border-radius:999px;border:1px solid #e5e7eb;font-size:11px;font-weight:500;color:#6b7280;margin:2px 2px 0 0}
.size-pill:hover,.size-pill.selected{background:#1D1D1B;color:#fff;border-color:#1D1D1B}
details>summary::marker,details>summary::-webkit-details-marker{display:none}
.chevron{transition:transform .2s ease}
details[open] .chevron{transform:rotate(180deg)}
input[type=checkbox]{accent-color:{{PRIMARY_COLOR}};cursor:pointer;width:13px;height:13px;border-radius:3px}
#toast{position:fixed;bottom:20px;right:20px;z-index:9999;background:#1D1D1B;color:#fff;font-size:12.5px;padding:9px 15px;border-radius:10px;opacity:0;transform:translateY(6px);transition:all .2s ease;pointer-events:none;white-space:nowrap}
#toast.show{opacity:1;transform:translateY(0)}
</style>
</head>
<body class="bg-white antialiased">

<div id="toast"></div>

<!-- NAVBAR -->
<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-[58px]">
  <div class="max-w-7xl mx-auto px-5 h-full flex items-center justify-between gap-6">
    <a href="/" class="shrink-0 flex items-center gap-2.5">
      <img src="LOGO_PLACEHOLDER" alt="{{BRAND_NAME}}" class="h-[30px] w-auto">
      <span class="hidden md:block text-[13px] font-semibold tracking-tight">{{BRAND_NAME}}</span>
    </a>
    <nav class="hidden md:flex items-center gap-6">
      <a href="#" class="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition">Shop</a>
      <a href="#" class="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition">Solutions</a>
      <a href="#" class="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition">Company</a>
      <a href="#" class="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition">Resources</a>
      <a href="{{CONTACT_URL}}" class="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition">Contact</a>
    </nav>
    <div class="flex items-center gap-3 shrink-0">
      <a href="#" class="hidden md:block text-[13px] font-medium text-gray-500 hover:text-gray-900 transition">Login</a>
      <div class="hidden md:block w-px h-4 bg-gray-200"></div>
      <button onclick="toggleCart()" class="relative p-1.5 hover:opacity-70 transition" aria-label="Cart">
        <i data-lucide="shopping-cart" class="w-[18px] h-[18px]"></i>
        <span id="cartBadge" style="display:none;background:{{PRIMARY_COLOR}}" class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white font-bold">0</span>
      </button>
      <button class="md:hidden p-1.5 hover:opacity-70 transition" aria-label="Menu"><i data-lucide="menu" class="w-5 h-5"></i></button>
    </div>
  </div>
</header>

<!-- SHOP HEADER -->
<section class="py-10 px-5 border-b border-gray-100 text-center">
  <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2.5">{{BRAND_NAME}}</p>
  <h1 class="text-[28px] md:text-[38px] font-light tracking-[-0.02em] leading-tight max-w-lg mx-auto">{{SHOP_TITLE}}</h1>
  <p class="mt-2 text-[13.5px] text-gray-500 max-w-md mx-auto leading-relaxed">{{BRAND_TAGLINE}}</p>
  <div class="mt-6 max-w-[420px] mx-auto flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus-within:border-gray-400 transition bg-white">
    <i data-lucide="search" class="w-[15px] h-[15px] text-gray-400 shrink-0"></i>
    <input id="searchInput" oninput="filterProducts()" type="text" placeholder="{{SEARCH_PLACEHOLDER}}"
           class="flex-1 text-[13px] outline-none placeholder-gray-400 bg-transparent">
  </div>
</section>

<!-- FILTER TOOLBAR -->
<div class="sticky top-[58px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-5 py-2 flex items-center gap-2.5">
    <button onclick="toggleSidebar()" class="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:border-gray-400 transition whitespace-nowrap">
      <i data-lucide="sliders-horizontal" class="w-3 h-3"></i>
      <span id="filterBtnText">Hide Filters</span>
    </button>
    <div class="w-px h-[18px] bg-gray-200 shrink-0"></div>
    <div class="flex items-center gap-1.5 overflow-x-auto flex-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 min-w-0">
      <button onclick="setCategory(this,'all')" class="cat-pill active shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600">All</button>
      <button onclick="setCategory(this,'{{CAT1}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600">{{CAT1}}</button>
      <button onclick="setCategory(this,'{{CAT2}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600">{{CAT2}}</button>
      <button onclick="setCategory(this,'{{CAT3}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600">{{CAT3}}</button>
      <button onclick="setCategory(this,'{{CAT4}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600">{{CAT4}}</button>
      <button onclick="setCategory(this,'{{CAT5}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600">{{CAT5}}</button>
      <button onclick="setCategory(this,'{{CAT6}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600">{{CAT6}}</button>
    </div>
    <div class="shrink-0 flex items-center gap-1.5 ml-1">
      <span class="text-[11px] text-gray-400 hidden md:block">Sort:</span>
      <select onchange="sortProducts(this.value)" class="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[12px] outline-none cursor-pointer text-gray-600">
        <option value="">Featured</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="name">Name A–Z</option>
      </select>
    </div>
  </div>
</div>

<!-- MAIN -->
<div class="max-w-7xl mx-auto px-5 py-7 flex gap-7 items-start">

  <!-- SIDEBAR -->
  <aside id="sidebar" class="w-52 shrink-0 sticky top-[108px] hidden lg:block">
    <div class="flex items-center justify-between mb-3">
      <span class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Filters</span>
      <button onclick="clearFilters()" class="text-[11px] text-gray-400 hover:text-gray-700 transition">Clear all</button>
    </div>
    <details open class="mb-2 rounded-xl border border-gray-200 overflow-hidden">
      <summary class="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100/80 transition text-[12.5px] font-medium">
        Product Type <i data-lucide="chevron-down" class="chevron w-3.5 h-3.5 text-gray-400 shrink-0"></i>
      </summary>
      <div class="px-4 py-3 bg-white space-y-2.5">
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{TF1}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{TF2}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{TF3}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{TF4}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{TF5}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{TF6}}</label>
      </div>
    </details>
    <details open class="mb-3 rounded-xl border border-gray-200 overflow-hidden">
      <summary class="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100/80 transition text-[12.5px] font-medium">
        Material <i data-lucide="chevron-down" class="chevron w-3.5 h-3.5 text-gray-400 shrink-0"></i>
      </summary>
      <div class="px-4 py-3 bg-white space-y-2.5">
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{MF1}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{MF2}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{MF3}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{MF4}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{MF5}}</label>
        <label class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer"><input type="checkbox"> {{MF6}}</label>
      </div>
    </details>
    <button onclick="showToast('Filters applied')" class="w-full py-2.5 rounded-xl text-[12.5px] font-semibold text-white transition hover:opacity-90" style="background:{{PRIMARY_COLOR}}">
      Apply Filters
    </button>
  </aside>

  <!-- PRODUCT GRID -->
  <main class="flex-1 min-w-0">
    <div class="flex items-center justify-between mb-4">
      <p class="text-[12.5px] text-gray-400">Showing <span id="productCount" class="font-semibold text-gray-700">12</span> products</p>
    </div>
    <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

      <!-- Delivery promo -->
      <div class="promo-tile col-span-full rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-5 flex items-center gap-4">
        <div class="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
          <i data-lucide="truck" class="w-4 h-4 text-gray-600"></i>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Free Delivery</p>
          <p class="text-[13px] font-medium mt-0.5">On all orders over {{PROMO_THRESHOLD}} incl. vat</p>
        </div>
      </div>

      <!-- PRODUCT 1 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P1_CAT}}" data-price="{{P1_PRICE}}" data-name="{{P1_NAME}}" data-sizes="{{P1_SIZES}}" data-index="0">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P1_IMG}}" alt="{{P1_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-[#1D1D1B] text-white tracking-wide">{{P1_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P1_NAME}}" data-price="{{P1_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P1_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P1_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 2 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P2_CAT}}" data-price="{{P2_PRICE}}" data-name="{{P2_NAME}}" data-sizes="{{P2_SIZES}}" data-index="1">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P2_IMG}}" alt="{{P2_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-amber-500 text-white tracking-wide">{{P2_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P2_NAME}}" data-price="{{P2_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P2_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P2_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 3 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P3_CAT}}" data-price="{{P3_PRICE}}" data-name="{{P3_NAME}}" data-sizes="{{P3_SIZES}}" data-index="2">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P3_IMG}}" alt="{{P3_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-emerald-600 text-white tracking-wide">{{P3_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P3_NAME}}" data-price="{{P3_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P3_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P3_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 4 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P4_CAT}}" data-price="{{P4_PRICE}}" data-name="{{P4_NAME}}" data-sizes="{{P4_SIZES}}" data-index="3">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P4_IMG}}" alt="{{P4_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-[#1D1D1B] text-white tracking-wide">{{P4_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P4_NAME}}" data-price="{{P4_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P4_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P4_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 5 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P5_CAT}}" data-price="{{P5_PRICE}}" data-name="{{P5_NAME}}" data-sizes="{{P5_SIZES}}" data-index="4">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P5_IMG}}" alt="{{P5_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-amber-500 text-white tracking-wide">{{P5_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P5_NAME}}" data-price="{{P5_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P5_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P5_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 6 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P6_CAT}}" data-price="{{P6_PRICE}}" data-name="{{P6_NAME}}" data-sizes="{{P6_SIZES}}" data-index="5">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P6_IMG}}" alt="{{P6_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-emerald-600 text-white tracking-wide">{{P6_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P6_NAME}}" data-price="{{P6_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P6_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P6_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- REWARDS TILE -->
      <div class="promo-tile col-span-full rounded-2xl p-6 flex items-center gap-5" style="background:#1D1D1B">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15)">
          <i data-lucide="gift" class="w-4 h-4" style="color:#fff"></i>
        </div>
        <div class="flex-1">
          <p class="text-[10px] font-bold uppercase tracking-widest mb-0.5" style="color:rgba(255,255,255,.4)">{{BRAND_NAME}} Rewards</p>
          <p class="text-[13px] font-medium" style="color:#fff">Get {{REWARDS_PERCENT}} back on every purchase*</p>
          <p class="text-[11.5px] mt-0.5" style="color:rgba(255,255,255,.5)">*Ts&Cs apply. Login or register to start earning.</p>
        </div>
        <a href="#" class="shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold transition hover:bg-white hover:text-gray-900" style="border-color:rgba(255,255,255,.25);color:#fff">Sign up</a>
      </div>

      <!-- PRODUCT 7 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P7_CAT}}" data-price="{{P7_PRICE}}" data-name="{{P7_NAME}}" data-sizes="{{P7_SIZES}}" data-index="6">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P7_IMG}}" alt="{{P7_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-[#1D1D1B] text-white tracking-wide">{{P7_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P7_NAME}}" data-price="{{P7_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P7_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P7_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 8 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P8_CAT}}" data-price="{{P8_PRICE}}" data-name="{{P8_NAME}}" data-sizes="{{P8_SIZES}}" data-index="7">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P8_IMG}}" alt="{{P8_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-amber-500 text-white tracking-wide">{{P8_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P8_NAME}}" data-price="{{P8_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P8_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P8_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 9 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P9_CAT}}" data-price="{{P9_PRICE}}" data-name="{{P9_NAME}}" data-sizes="{{P9_SIZES}}" data-index="8">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P9_IMG}}" alt="{{P9_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-emerald-600 text-white tracking-wide">{{P9_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P9_NAME}}" data-price="{{P9_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P9_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P9_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 10 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P10_CAT}}" data-price="{{P10_PRICE}}" data-name="{{P10_NAME}}" data-sizes="{{P10_SIZES}}" data-index="9">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P10_IMG}}" alt="{{P10_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-[#1D1D1B] text-white tracking-wide">{{P10_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P10_NAME}}" data-price="{{P10_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P10_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P10_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 11 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P11_CAT}}" data-price="{{P11_PRICE}}" data-name="{{P11_NAME}}" data-sizes="{{P11_SIZES}}" data-index="10">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P11_IMG}}" alt="{{P11_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-amber-500 text-white tracking-wide">{{P11_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P11_NAME}}" data-price="{{P11_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P11_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P11_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT 12 -->
      <div class="product-card rounded-2xl border border-gray-200 bg-white overflow-hidden" data-category="{{P12_CAT}}" data-price="{{P12_PRICE}}" data-name="{{P12_NAME}}" data-sizes="{{P12_SIZES}}" data-index="11">
        <div class="relative aspect-square bg-gray-50 overflow-hidden">
          <img src="IMG:{{P12_IMG}}" alt="{{P12_NAME}}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
          <span class="badge absolute top-2.5 left-2.5 text-[10px] font-bold rounded-full px-2 py-0.5 bg-emerald-600 text-white tracking-wide">{{P12_BADGE}}</span>
          <div class="add-overlay absolute inset-x-3 bottom-3">
            <button onclick="addToCart(this)" data-name="{{P12_NAME}}" data-price="{{P12_PRICE}}" class="w-full py-2 rounded-xl text-[12.5px] font-semibold text-white" style="background:rgba(29,29,27,.9);backdrop-filter:blur(4px)">+ Add to cart</button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-[13.5px] font-medium leading-snug">{{P12_NAME}}</h3>
          <div class="sizes-container mt-2"></div>
          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-[11px] text-gray-400">From</span>
            <span class="text-[16px] font-semibold tabular-nums">{{CURRENCY}}{{P12_PRICE}}</span>
            <span class="text-[11px] text-gray-400">incl. vat</span>
          </div>
        </div>
      </div>

    </div>
  </main>
</div>

<!-- CTA -->
<section class="border-t border-gray-100 py-16 px-5 text-center">
  <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">{{CTA_SUBTITLE}}</p>
  <h2 class="text-[26px] md:text-[34px] font-light tracking-tight max-w-lg mx-auto leading-snug">{{CTA_TITLE}}</h2>
  <a href="{{CONTACT_URL}}" class="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3 text-[13px] font-semibold text-white transition hover:opacity-90" style="background:{{PRIMARY_COLOR}}">
    Get in touch <i data-lucide="arrow-right" class="w-4 h-4" style="color:#fff"></i>
  </a>
</section>

<!-- FOOTER -->
<footer class="bg-gray-50 border-t border-gray-200">
  <div class="max-w-7xl mx-auto px-5 py-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="col-span-2 md:col-span-1">
        <img src="LOGO_PLACEHOLDER" alt="{{BRAND_NAME}}" class="h-9 w-auto mb-3">
        <p class="text-[12.5px] text-gray-500 leading-relaxed max-w-[200px]">{{FOOTER_TAGLINE}}</p>
        <div class="flex items-center gap-2 mt-4">
          <a href="{{FACEBOOK_URL}}" class="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 transition"><i data-lucide="facebook" class="w-3.5 h-3.5 text-gray-500"></i></a>
          <a href="{{INSTAGRAM_URL}}" class="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 transition"><i data-lucide="instagram" class="w-3.5 h-3.5 text-gray-500"></i></a>
          <a href="{{LINKEDIN_URL}}" class="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 transition"><i data-lucide="linkedin" class="w-3.5 h-3.5 text-gray-500"></i></a>
        </div>
      </div>
      <div>
        <p class="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-3">Shop</p>
        <ul class="space-y-2">
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">All Products</a></li>
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">{{CAT1}}</a></li>
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">{{CAT2}}</a></li>
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">{{CAT3}}</a></li>
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">Promotions</a></li>
        </ul>
      </div>
      <div>
        <p class="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-3">Company</p>
        <ul class="space-y-2">
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">About Us</a></li>
          <li><a href="{{CONTACT_URL}}" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">Contact</a></li>
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">Blog</a></li>
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">FAQs</a></li>
        </ul>
      </div>
      <div>
        <p class="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-3">Legal</p>
        <ul class="space-y-2">
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">Privacy Policy</a></li>
          <li><a href="#" class="text-[12.5px] text-gray-600 hover:text-gray-900 transition">Terms &amp; Conditions</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-200 mt-10 pt-5 flex flex-col md:flex-row justify-between items-center gap-3 text-[11.5px] text-gray-400">
      <span>© {{BRAND_NAME}} {{COPYRIGHT_YEAR}}. All Rights Reserved.</span>
      <a href="{{CONTACT_URL}}" class="hover:text-gray-700 transition">Contact Us</a>
    </div>
  </div>
</footer>

<script>
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderSizePills();
});

// CART
var cartCount = 0;
function addToCart(btn) {
  cartCount++;
  var badge = document.getElementById('cartBadge');
  badge.textContent = cartCount;
  badge.style.display = 'flex';
  showToast('Added: ' + btn.dataset.name);
  var orig = btn.textContent;
  btn.textContent = '✓ Added';
  btn.style.background = 'rgba(22,163,74,.9)';
  setTimeout(function() { btn.textContent = orig; btn.style.background = 'rgba(29,29,27,.9)'; }, 1600);
}
function toggleCart() {
  showToast(cartCount === 0 ? 'Your cart is empty' : cartCount + ' item' + (cartCount > 1 ? 's' : '') + ' in cart');
}

// TOAST
var toastTimer;
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2200);
}

// SIDEBAR
var sidebarOpen = true;
function toggleSidebar() {
  var s = document.getElementById('sidebar');
  var btn = document.getElementById('filterBtnText');
  sidebarOpen = !sidebarOpen;
  s.classList.toggle('hidden', !sidebarOpen);
  btn.textContent = sidebarOpen ? 'Hide Filters' : 'Show Filters';
}
function clearFilters() {
  document.querySelectorAll('#sidebar input[type=checkbox]').forEach(function(cb) { cb.checked = false; });
  showToast('Filters cleared');
}

// CATEGORY FILTER
var activeCategory = 'all';
function setCategory(btn, cat) {
  document.querySelectorAll('.cat-pill').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  activeCategory = cat;
  filterProducts();
}

// SEARCH + FILTER
function filterProducts() {
  var search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  var cards = document.querySelectorAll('.product-card');
  var visible = 0;
  cards.forEach(function(card) {
    var cat = (card.dataset.category || '').toLowerCase();
    var name = (card.dataset.name || '').toLowerCase();
    var catOk = activeCategory === 'all' || cat === activeCategory.toLowerCase();
    var searchOk = !search || name.includes(search);
    var show = catOk && searchOk;
    card.classList.toggle('filtered-out', !show);
    if (show) visible++;
  });
  var el = document.getElementById('productCount');
  if (el) el.textContent = visible;
}

// SORT
function sortProducts(value) {
  var grid = document.getElementById('productGrid');
  var cards = Array.from(grid.querySelectorAll('.product-card'));
  cards.forEach(function(c) { c.remove(); });
  cards.sort(function(a, b) {
    if (value === 'price-asc') return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
    if (value === 'price-desc') return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
    if (value === 'name') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
    return parseInt(a.dataset.index) - parseInt(b.dataset.index);
  });
  var promos = Array.from(grid.querySelectorAll('.promo-tile'));
  var mid = promos[1];
  cards.slice(0, 6).forEach(function(c) { if (mid) mid.before(c); else grid.appendChild(c); });
  cards.slice(6).forEach(function(c) { grid.appendChild(c); });
}

// SIZE PILLS
function renderSizePills() {
  document.querySelectorAll('.product-card').forEach(function(card) {
    var sizes = (card.dataset.sizes || '').trim();
    if (!sizes) return;
    var container = card.querySelector('.sizes-container');
    if (!container) return;
    sizes.split(',').forEach(function(s) {
      s = s.trim();
      if (!s) return;
      var pill = document.createElement('span');
      pill.className = 'size-pill';
      pill.textContent = s;
      pill.onclick = function() {
        container.querySelectorAll('.size-pill').forEach(function(p) { p.classList.remove('selected'); });
        pill.classList.add('selected');
      };
      container.appendChild(pill);
    });
  });
}
</script>
</body>
</html>`;
