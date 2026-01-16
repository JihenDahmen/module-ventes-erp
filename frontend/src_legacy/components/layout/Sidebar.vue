<template>
  <div class="col-md-3 col-lg-2 d-md-block sidebar collapse">
    <div class="position-sticky pt-3">
      <!-- Dashboard -->
      <div class="mb-4">
        <router-link to="/" class="nav-link d-flex align-items-center" active-class="active">
          <i class="bi bi-speedometer2 me-3"></i>
          <span>Dashboard</span>
        </router-link>
      </div>

      <!-- Ventes -->
      <h6 class="sidebar-heading px-3 mt-4 mb-1 text-white-50">
        <small>VENTES</small>
      </h6>
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/clients" class="nav-link" active-class="active">
            <i class="bi bi-people me-3"></i> Clients
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/factures" class="nav-link" active-class="active">
            <i class="bi bi-receipt me-3"></i> Factures
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/paiements" class="nav-link" active-class="active">
            <i class="bi bi-credit-card me-3"></i> Paiements
          </router-link>
        </li>
      </ul>

      <!-- Produits -->
      <h6 class="sidebar-heading px-3 mt-4 mb-1 text-white-50">
        <small>PRODUITS</small>
      </h6>
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/produits" class="nav-link" active-class="active">
            <i class="bi bi-box-seam me-3"></i> Produits
          </router-link>
        </li>
      </ul>

      <!-- Retours -->
      <h6 class="sidebar-heading px-3 mt-4 mb-1 text-white-50">
        <small>RETOURS</small>
      </h6>
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/retours" class="nav-link" active-class="active">
            <i class="bi bi-arrow-return-left me-3"></i> Retours
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/avoirs" class="nav-link" active-class="active">
            <i class="bi bi-credit-card-2-front me-3"></i> Avoirs
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar'
};
</script>