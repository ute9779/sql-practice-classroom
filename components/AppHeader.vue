<template>
  <header class="bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg">
    <div class="max-w-[1600px] mx-auto px-4 py-4 flex items-center">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2" />
          <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke="currentColor" stroke-width="2" />
          <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" stroke="currentColor" stroke-width="2" />
        </svg>
        <h1 class="text-white text-xl font-bold tracking-wide group-hover:underline">
          SQL演習教室
        </h1>
      </NuxtLink>
    </div>
  </header>
</template>
