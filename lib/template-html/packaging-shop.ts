export const packagingShopTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{SHOP_TITLE}} | {{BRAND_NAME}}</title>
<meta name="description" content="{{BRAND_TAGLINE}}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<style>
*{font-family:'Inter',sans-serif;color:#1D1D1B}
.cat-pill.active{background:{{PRIMARY_COLOR}};color:#fff;border-color:{{PRIMARY_COLOR}}}
.badge:empty{display:none}
.add-btn:hover{border-color:{{PRIMARY_COLOR}};color:{{PRIMARY_COLOR}}}
details>summary::marker{display:none}
details>summary::-webkit-details-marker{display:none}
</style>
</head>
<body class="bg-white">

<!-- NAVBAR -->
<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-16">
  <div class="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-6">
    <a href="/" class="shrink-0 flex items-center gap-2">
      <img src="LOGO_PLACEHOLDER" alt="{{BRAND_NAME}}" class="h-8 w-auto">
      <span class="hidden md:block text-sm font-semibold tracking-tight">{{BRAND_NAME}}</span>
    </a>
    <nav class="hidden md:flex items-center gap-7 text-sm font-medium">
      <a href="#" class="hover:opacity-60 transition">Shop</a>
      <a href="#" class="hover:opacity-60 transition">Solutions</a>
      <a href="#" class="hover:opacity-60 transition">Company</a>
      <a href="#" class="hover:opacity-60 transition">Resources</a>
      <a href="{{CONTACT_URL}}" class="hover:opacity-60 transition">Contact Us</a>
    </nav>
    <div class="flex items-center gap-3 shrink-0">
      <button class="relative p-2 hover:opacity-60 transition" aria-label="Cart">
        <i data-lucide="shopping-cart" class="w-5 h-5"></i>
        <span class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white font-semibold" style="background:{{PRIMARY_COLOR}}">0</span>
      </button>
      <a href="#" class="hidden md:inline-flex items-center px-4 py-1.5 rounded-full border border-[#1D1D1B] text-sm font-medium hover:bg-[#1D1D1B] hover:text-white transition">Login</a>
      <button class="md:hidden p-2 hover:opacity-60 transition" aria-label="Menu"><i data-lucide="menu" class="w-5 h-5"></i></button>
    </div>
  </div>
</header>

<!-- SHOP HEADER -->
<section class="border-b border-gray-100 py-14 px-6">
  <div class="max-w-2xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-light tracking-tight">{{SHOP_TITLE}}</h1>
    <p class="mt-3 text-gray-500 text-sm md:text-base">{{BRAND_TAGLINE}}</p>
    <div class="mt-8 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm max-w-lg mx-auto">
      <i data-lucide="search" class="w-4 h-4 text-gray-400 shrink-0"></i>
      <input type="text" placeholder="{{SEARCH_PLACEHOLDER}}" class="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent">
    </div>
  </div>
</section>

<!-- FILTER TOOLBAR (sticky) -->
<div class="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 overflow-x-auto">
    <button onclick="toggleSidebar()" class="shrink-0 flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-gray-400 transition whitespace-nowrap">
      <i data-lucide="sliders-horizontal" class="w-4 h-4"></i>
      <span id="filterBtnText">Hide Filters</span>
    </button>
    <div class="flex items-center gap-2 flex-nowrap overflow-x-auto">
      <button onclick="setCategory(this,'all')" class="cat-pill active shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">All Products</button>
      <button onclick="setCategory(this,'{{CAT1}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT1}}</button>
      <button onclick="setCategory(this,'{{CAT2}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT2}}</button>
      <button onclick="setCategory(this,'{{CAT3}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT3}}</button>
      <button onclick="setCategory(this,'{{CAT4}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT4}}</button>
      <button onclick="setCategory(this,'{{CAT5}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT5}}</button>
      <button onclick="setCategory(this,'{{CAT6}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT6}}</button>
      <button onclick="setCategory(this,'{{CAT7}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT7}}</button>
      <button onclick="setCategory(this,'{{CAT8}}')" class="cat-pill shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition whitespace-nowrap">{{CAT8}}</button>
    </div>
    <div class="ml-auto shrink-0 flex items-center gap-2">
      <span class="text-xs text-gray-500 whitespace-nowrap hidden md:block">Sort by:</span>
      <select class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none cursor-pointer">
        <option>Latest</option>
        <option>Price: low to high</option>
        <option>Price: high to low</option>
      </select>
    </div>
  </div>
</div>

<!-- MAIN BODY -->
<div class="max-w-7xl mx-auto px-6 py-10 flex gap-10 items-start">

  <!-- SIDEBAR -->
  <aside id="sidebar" class="hidden lg:block w-56 shrink-0 sticky top-36">
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm font-semibold">Filters</span>
      <button class="text-xs text-gray-400 hover:text-gray-700 transition">Clear All</button>
    </div>

    <!-- Type filters -->
    <details open class="rounded-2xl border border-gray-200 overflow-hidden mb-3 bg-gray-50/50">
      <summary class="px-5 py-4 cursor-pointer font-medium text-sm flex justify-between items-center select-none">
        Categories <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400 shrink-0"></i>
      </summary>
      <div class="px-5 pb-5 space-y-2">
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> All</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF1}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF2}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF3}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF4}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF5}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF6}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF7}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF8}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF9}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{TF10}}</label>
      </div>
    </details>

    <!-- Material filters -->
    <details open class="rounded-2xl border border-gray-200 overflow-hidden mb-3 bg-gray-50/50">
      <summary class="px-5 py-4 cursor-pointer font-medium text-sm flex justify-between items-center select-none">
        Material <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400 shrink-0"></i>
      </summary>
      <div class="px-5 pb-5 space-y-2">
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> All</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF1}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF2}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF3}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF4}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF5}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF6}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF7}}</label>
        <label class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition"><input type="checkbox" class="rounded accent-[{{PRIMARY_COLOR}}]"> {{MF8}}</label>
      </div>
    </details>
  </aside>

  <!-- PRODUCT GRID -->
  <main class="flex-1 min-w-0">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8">

      <!-- PROMO TILE: Delivery -->
      <div class="col-span-full rounded-3xl bg-gray-50 border border-dashed border-gray-200 p-8 flex flex-col md:flex-row items-center gap-6">
        <div class="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm shrink-0">
          <i data-lucide="truck" class="w-6 h-6 text-gray-700"></i>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Delivery</p>
          <h4 class="font-medium text-base">We offer nationwide delivery.</h4>
          <p class="text-sm text-gray-500 mt-1">Free delivery on orders over {{PROMO_THRESHOLD}} incl. vat</p>
        </div>
      </div>

      <!-- PRODUCT 1 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P1_IMG}}" alt="{{P1_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-[#1D1D1B] text-white">{{P1_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P1_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P1_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 2 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P2_IMG}}" alt="{{P2_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-[#1D1D1B] text-white">{{P2_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P2_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P2_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 3 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P3_IMG}}" alt="{{P3_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-800">{{P3_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P3_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P3_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 4 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P4_IMG}}" alt="{{P4_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-[#1D1D1B] text-white">{{P4_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P4_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P4_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 5 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P5_IMG}}" alt="{{P5_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-[#1D1D1B] text-white">{{P5_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P5_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P5_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 6 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P6_IMG}}" alt="{{P6_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-800">{{P6_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P6_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P6_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PROMO TILE: Rewards (mid-grid) -->
      <div class="col-span-full rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 text-white" style="background:#1D1D1B">
        <div class="rounded-2xl p-4 border border-white/20 shrink-0" style="background:rgba(255,255,255,0.1)">
          <i data-lucide="gift" class="w-6 h-6 text-white"></i>
        </div>
        <div class="flex-1">
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:rgba(255,255,255,0.5)">{{BRAND_NAME}} Rewards</p>
          <h4 class="font-medium text-base text-white">Get {{REWARDS_PERCENT}} back on every purchase*</h4>
          <p class="text-sm mt-0.5" style="color:rgba(255,255,255,0.6)">*Ts&amp;Cs apply. Login or register to start earning.</p>
        </div>
        <a href="#" class="shrink-0 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition whitespace-nowrap">Sign up now</a>
      </div>

      <!-- PRODUCT 7 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P7_IMG}}" alt="{{P7_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-[#1D1D1B] text-white">{{P7_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P7_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P7_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 8 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P8_IMG}}" alt="{{P8_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-800">{{P8_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P8_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P8_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 9 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P9_IMG}}" alt="{{P9_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-[#1D1D1B] text-white">{{P9_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P9_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P9_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 10 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P10_IMG}}" alt="{{P10_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-800">{{P10_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P10_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P10_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 11 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P11_IMG}}" alt="{{P11_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-[#1D1D1B] text-white">{{P11_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P11_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P11_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- PRODUCT 12 -->
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
        <div class="aspect-square bg-gray-50 relative overflow-hidden">
          <img src="IMG:{{P12_IMG}}" alt="{{P12_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="badge absolute top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-800">{{P12_BADGE}}</span>
        </div>
        <div class="p-5">
          <h3 class="font-medium text-sm leading-snug">{{P12_NAME}}</h3>
          <div class="flex items-baseline gap-1.5 mt-3">
            <span class="text-xs text-gray-400">From</span>
            <span class="font-semibold text-lg tabular-nums">{{CURRENCY}}{{P12_PRICE}}</span>
            <span class="text-xs text-gray-400">incl. vat</span>
          </div>
          <button class="add-btn mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
          </button>
        </div>
      </div>

      <!-- LOAD MORE -->
      <div class="col-span-full flex justify-center pt-4">
        <button class="rounded-full border border-gray-300 px-8 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">View more</button>
      </div>

    </div>
  </main>
</div>

<!-- CTA SECTION -->
<section class="border-t border-gray-100 py-20 px-6">
  <div class="max-w-3xl mx-auto text-center">
    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{{CTA_SUBTITLE}}</p>
    <h2 class="text-3xl md:text-4xl font-light tracking-tight leading-snug">{{CTA_TITLE}}</h2>
    <a href="{{CONTACT_URL}}" class="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition hover:opacity-90" style="background:{{PRIMARY_COLOR}}">
      Get in touch
      <i data-lucide="arrow-right" class="w-4 h-4 text-white"></i>
    </a>
  </div>
</section>

<!-- FOOTER -->
<footer class="bg-gray-50 border-t border-gray-200">
  <div class="max-w-7xl mx-auto px-6 py-14">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-10">
      <div class="col-span-2 md:col-span-1">
        <img src="LOGO_PLACEHOLDER" alt="{{BRAND_NAME}}" class="h-10 w-auto mb-4">
        <p class="text-sm text-gray-500 leading-relaxed">{{FOOTER_TAGLINE}}</p>
        <div class="flex items-center gap-3 mt-5">
          <a href="{{FACEBOOK_URL}}" target="_blank" aria-label="Facebook" class="p-2 rounded-full border border-gray-200 hover:border-gray-400 transition"><i data-lucide="facebook" class="w-4 h-4 text-gray-600"></i></a>
          <a href="{{INSTAGRAM_URL}}" target="_blank" aria-label="Instagram" class="p-2 rounded-full border border-gray-200 hover:border-gray-400 transition"><i data-lucide="instagram" class="w-4 h-4 text-gray-600"></i></a>
          <a href="{{LINKEDIN_URL}}" target="_blank" aria-label="LinkedIn" class="p-2 rounded-full border border-gray-200 hover:border-gray-400 transition"><i data-lucide="linkedin" class="w-4 h-4 text-gray-600"></i></a>
        </div>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Shop</p>
        <ul class="space-y-2 text-sm text-gray-600">
          <li><a href="#" class="hover:text-gray-900 transition">All Products</a></li>
          <li><a href="#" class="hover:text-gray-900 transition">{{CAT1}}</a></li>
          <li><a href="#" class="hover:text-gray-900 transition">{{CAT2}}</a></li>
          <li><a href="#" class="hover:text-gray-900 transition">{{CAT3}}</a></li>
          <li><a href="#" class="hover:text-gray-900 transition">Promotions</a></li>
        </ul>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Company</p>
        <ul class="space-y-2 text-sm text-gray-600">
          <li><a href="#" class="hover:text-gray-900 transition">About Us</a></li>
          <li><a href="{{CONTACT_URL}}" class="hover:text-gray-900 transition">Contact</a></li>
          <li><a href="#" class="hover:text-gray-900 transition">Blog</a></li>
          <li><a href="#" class="hover:text-gray-900 transition">FAQs</a></li>
        </ul>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Legal</p>
        <ul class="space-y-2 text-sm text-gray-600">
          <li><a href="#" class="hover:text-gray-900 transition">Privacy Policy</a></li>
          <li><a href="#" class="hover:text-gray-900 transition">Terms &amp; Conditions</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
      <span>© {{BRAND_NAME}} {{COPYRIGHT_YEAR}}. All Rights Reserved.</span>
      <a href="{{CONTACT_URL}}" class="hover:text-gray-700 transition">Contact Us</a>
    </div>
  </div>
</footer>

<script>
document.addEventListener('DOMContentLoaded', () => { lucide.createIcons(); });
let sidebarOpen = true;
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const t = document.getElementById('filterBtnText');
  sidebarOpen = !sidebarOpen;
  s.classList.toggle('lg:block', sidebarOpen);
  s.classList.toggle('hidden', !sidebarOpen);
  t.textContent = sidebarOpen ? 'Hide Filters' : 'Show Filters';
}
function setCategory(btn, cat) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
}
</script>
</body>
</html>`;
