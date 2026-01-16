<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">ERP System</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              ERP Core
            </a>
            <ul class="dropdown-menu">
              <li><router-link class="dropdown-item" to="/quotes">Quotes</router-link></li>
              <li><router-link class="dropdown-item" to="/orders">Orders</router-link></li>
              <li><router-link class="dropdown-item" to="/deliveries">Deliveries</router-link></li>
              <li><router-link class="dropdown-item" to="/invoices">Invoices</router-link></li>
              <li><router-link class="dropdown-item" to="/payments">Payments</router-link></li>
              <li><router-link class="dropdown-item" to="/returns">Returns</router-link></li>
              <li><router-link class="dropdown-item" to="/reporting">Reporting</router-link></li>
            </ul>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/sales">Sales Dashboard</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container-fluid">
    <RouterView />
  </div>
</template>

<style>
/* Global overrides if needed */
</style>
