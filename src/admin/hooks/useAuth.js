import React, { useState, useEffect, createContext, useContext } from 'react';
import { LayoutDashboard, Users, Store, FileCheck, Bell, Settings, LogOut, Menu, X, ChevronDown, Search, Filter, TrendingUp, DollarSign, ShoppingBag, Star } from 'lucide-react';

// ============================================
// CONTEXT & AUTH
// ============================================
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

