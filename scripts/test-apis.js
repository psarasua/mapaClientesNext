#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      endpoint,
      status: response.status,
      success: response.ok,
      data: data
    };
  } catch (error) {
    return {
      endpoint,
      status: 'ERROR',
      success: false,
      error: error.message
    };
  }
}

async function testAllAPIs() {
  console.log('🧪 Probando todas las APIs...\n');
  
  const tests = [
    { endpoint: '/api/health', description: 'Health Check' },
    { endpoint: '/api/users', description: 'Usuarios' },
    { endpoint: '/api/trucks', description: 'Camiones' },
    { endpoint: '/api/clients', description: 'Clientes' },
    { endpoint: '/api/diasEntrega', description: 'Días de Entrega' },
    { endpoint: '/api/repartos', description: 'Repartos' },
    { endpoint: '/api/clientesporreparto', description: 'Clientes por Reparto' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`🔍 Probando: ${test.description} (${test.endpoint})`);
    const result = await testAPI(test.endpoint);
    results.push({ ...result, description: test.description });
    
    if (result.success) {
      console.log(`✅ ${test.description}: ${result.status} - ${result.data?.total || 0} registros`);
    } else {
      console.log(`❌ ${test.description}: ${result.status} - ${result.error || result.data?.error}`);
    }
  }
  
  console.log('\n📊 Resumen:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Exitosas: ${successful}`);
  console.log(`❌ Fallidas: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ APIs con problemas:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.description}: ${r.error || r.data?.error}`);
    });
  }
  
  return results;
}

testAllAPIs(); 