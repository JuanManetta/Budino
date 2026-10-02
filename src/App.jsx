import { useState, useEffect } from "react";
import { 
  Home, 
  ShoppingBag, 
  Calendar as CalendarIcon, 
  Package, 
  Plus, 
  Trash2, 
  Edit2,
  Check,
  X,
  TrendingUp, 
  DollarSign,
  CheckCircle2,
  Loader2,
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "./supabaseClient";
import budinoLogo from "../public/budinoLogo.jpg";
import './App.css';

export default function App() {
  const [isAutenticado, setIsAutenticado] = useState(() => {
    return localStorage.getItem("miga_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [errorPassword, setErrorPassword] = useState(false);

  const [activeTab, setActiveTab] = useState("resumen");
  const [ventas, setVentas] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el día seleccionado en el calendario
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // Estado para navegar por los meses en el calendario
  const [fechaVista, setFechaVista] = useState(new Date());

  // Formulario nueva venta
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState(1);
  const [nuevoPrecio, setNuevoPrecio] = useState(0);
  const [nuevoPago, setNuevoPago] = useState("Transferencia");
  const [mensajeExitoVenta, setMensajeExitoVenta] = useState(false);

  // Formulario nuevo producto
  const [nuevoNombreProd, setNuevoNombreProd] = useState("");
  const [nuevoPesoProd, setNuevoPesoProd] = useState("");
  const [nuevoPrecioProd, setNuevoPrecioProd] = useState("");
  const [mensajeExitoProd, setMensajeExitoProd] = useState(false);

  // Estado para editar producto
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editPrecio, setEditPrecio] = useState("");

  const CLASE_SECRETA = "Manetta010304"; // Contraseña de acceso

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === CLASE_SECRETA) {
      setIsAutenticado(true);
      localStorage.setItem("miga_auth", "true");
    } else {
      setErrorPassword(true);
      setTimeout(() => setErrorPassword(false), 2500);
    }
  };

  useEffect(() => {
    if (isAutenticado) {
      // eslint-disable-next-line react-hooks/immutability
      fetchDatos();
    }
  }, [isAutenticado]);

  const fetchDatos = async () => {
    setLoading(true);
    
    const { data: prods, error: errProds } = await supabase
      .from('productos')
      .select('*')
      .order('id');

    if (errProds) console.error('Error al cargar productos:', errProds);
    else {
      setProductosCatalogo(prods || []);
      if (prods && prods.length > 0) {
        setProductoSeleccionadoId(prods[0].id);
        setNuevoPrecio(prods[0].precio * 1);
      }
    }

    const { data: vts, error: errVts } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false });

    if (errVts) console.error('Error al cargar ventas:', errVts);
    else setVentas(vts || []);

    setLoading(false);
  };

  const handleProductoChange = (id) => {
    setProductoSeleccionadoId(id);
    const prod = productosCatalogo.find(p => p.id === Number(id));
    if (prod) {
      setNuevoPrecio(prod.precio * Number(nuevaCantidad));
    }
  };

  const handleCantidadChange = (cant) => {
    const cantidadNum = Math.max(1, Number(cant) || 1);
    setNuevaCantidad(cantidadNum);
    const prod = productosCatalogo.find(p => p.id === Number(productoSeleccionadoId));
    if (prod) {
      setNuevoPrecio(prod.precio * cantidadNum);
    }
  };

  const agregarVenta = async (e) => {
    e.preventDefault();
    const prod = productosCatalogo.find(p => p.id === Number(productoSeleccionadoId));
    if (!prod) return;

    const cantidadNum = Number(nuevaCantidad) || 1;
    const precioTotalCalculado = prod.precio * cantidadNum;
    const nombreCompleto = `${prod.nombre} (${prod.peso})`;
    const fechaHoy = new Date().toISOString().split("T")[0];

    const nuevaVenta = {
      producto: nombreCompleto,
      cantidad: cantidadNum,
      precio: Number(precioTotalCalculado),
      pago: nuevoPago,
      fecha: fechaHoy,
    };

    const { data, error } = await supabase
      .from('ventas')
      .insert([nuevaVenta])
      .select();

    if (error) {
      console.error('Error al guardar venta:', error);
      alert('Hubo un error al guardar la venta');
    } else if (data) {
      setVentas([data[0], ...ventas]);
      setMensajeExitoVenta(true);
      setTimeout(() => setMensajeExitoVenta(false), 2500);
      setNuevaCantidad(1);
      setNuevoPrecio(prod.precio);
    }
  };

  const eliminarVenta = async (id) => {
    const { error } = await supabase.from('ventas').delete().eq('id', id);
    if (error) console.error('Error al eliminar:', error);
    else setVentas(ventas.filter(v => v.id !== id));
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    if (!nuevoNombreProd || !nuevoPesoProd || !nuevoPrecioProd) return;

    const nuevoProdObj = {
      nombre: nuevoNombreProd,
      peso: nuevoPesoProd,
      precio: Number(nuevoPrecioProd)
    };

    const { data, error } = await supabase
      .from('productos')
      .insert([nuevoProdObj])
      .select();

    if (error) {
      console.error('Error al guardar producto:', error);
      alert('Hubo un error al crear el producto');
    } else if (data) {
      setProductosCatalogo([...productosCatalogo, data[0]]);
      setNuevoNombreProd("");
      setNuevoPesoProd("");
      setNuevoPrecioProd("");
      setMensajeExitoProd(true);
      setTimeout(() => setMensajeExitoProd(false), 2500);
    }
  };

  const eliminarProducto = async (id) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar producto:', error);
      alert('No se pudo eliminar el producto');
    } else {
      setProductosCatalogo(productosCatalogo.filter(p => p.id !== id));
    }
  };

  const iniciarEdicion = (p) => {
    setEditandoId(p.id);
    setEditNombre(p.nombre);
    setEditPeso(p.peso);
    setEditPrecio(p.precio);
  };

  const guardarEdicion = async (id) => {
    const { error } = await supabase
      .from('productos')
      .update({
        nombre: editNombre,
        peso: editPeso,
        precio: Number(editPrecio)
      })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el producto');
    } else {
      setProductosCatalogo(productosCatalogo.map(p => 
        p.id === id ? { ...p, nombre: editNombre, peso: editPeso, precio: Number(editPrecio) } : p
      ));
      setEditandoId(null);
    }
  };

  // --- AGRUPAR VENTAS POR DÍA ---
  const ventasPorDia = {};
  ventas.forEach(v => {
    if (!v.fecha) return;
    const fechaKey = v.fecha.split('T')[0];
    if (!ventasPorDia[fechaKey]) {
      ventasPorDia[fechaKey] = { total: 0, lista: [] };
    }
    ventasPorDia[fechaKey].total += Number(v.precio);
    ventasPorDia[fechaKey].lista.push(v);
  });

  // Manejo de meses para el calendario
  const mesAnterior = () => {
    setFechaVista(new Date(fechaVista.getFullYear(), fechaVista.getMonth() - 1, 1));
    setDiaSeleccionado(null);
  };

  const mesSiguiente = () => {
    setFechaVista(new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 1));
    setDiaSeleccionado(null);
  };

  const year = fechaVista.getFullYear();
  const month = fechaVista.getMonth(); // 0 al 11
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const mesNombre = fechaVista.toLocaleString('es-ES', { month: 'long' });

  // Métricas
  const hoyStr = new Date().toISOString().split("T")[0];
  const ventasHoy = ventas.filter(v => v.fecha && v.fecha.split('T')[0] === hoyStr);
  const totalDia = ventasHoy.reduce((acc, v) => acc + Number(v.precio), 0);
  const totalSemana = ventas.reduce((acc, v) => acc + Number(v.precio), 0); 
  const totalMes = ventas.reduce((acc, v) => acc + Number(v.precio), 0);

  const totalUnidades = ventas.reduce((acc, v) => acc + Number(v.cantidad), 0) || 1;
  const conteoProductos = {};
  ventas.forEach(v => {
    conteoProductos[v.producto] = (conteoProductos[v.producto] || 0) + Number(v.cantidad);
  });

  if (!isAutenticado) {
    return (
      <div className="login-screen">
        <div className="card login-card">
          <div className="login-icon-box">
            <Lock size={28} color="#8C5835" />
          </div>
          <span className="header-subtitle">Budino · Pastelería</span>
          <h1 className="header-title" style={{ fontSize: '22px', marginBottom: '8px' }}>Acceso Privado ✨</h1>
          <p className="section-desc" style={{ marginBottom: '20px' }}>Ingresa la contraseña para ver el panel.</p>

          {errorPassword && (
            <div className="success-alert" style={{ backgroundColor: '#fef2f2', color: '#dc2626', marginBottom: '16px' }}>
              Contraseña incorrecta.
            </div>
          )}

          <form onSubmit={handleLogin} className="form-stack">
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="form-input"
              autoFocus
              required
            />
            <button type="submit" className="submit-btn">
              Entrar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        
        <header className="app-header">
          <div>
            <span className="header-subtitle">Budino · Pastelería</span>
            <h1 className="header-title">Hola, Ernes ✨</h1>
          </div>
          <div className="header-avatar">
            <img src={budinoLogo} alt="Avatar" />
          </div>
        </header>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={32} />
            <p>Conectando con Supabase...</p>
          </div>
        ) : (
          <>
            {activeTab === "resumen" && (
              <div className="tab-content">
                <div className="kpi-container">
                  <div className="kpi-main-card">
                    <div>
                      <p className="kpi-label">Recaudación del día</p>
                      <h2 className="kpi-value">${totalDia.toLocaleString()}</h2>
                    </div>
                    <div className="kpi-icon-box">
                      <DollarSign size={24} />
                    </div>
                  </div>

                  <div className="kpi-grid-2">
                    <div className="card">
                      <p className="card-subtitle">Semanal</p>
                      <h3 className="card-value">${totalSemana.toLocaleString()}</h3>
                    </div>
                    <div className="card">
                      <p className="card-subtitle">Mensual</p>
                      <h3 className="card-value">${totalMes.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>

                <div className="card form-card">
                  <h3 className="section-title">
                    <Plus size={20} /> Registrar Venta Rápida
                  </h3>
                  
                  {mensajeExitoVenta && (
                    <div className="success-alert">
                      <CheckCircle2 size={16} /> ¡Venta guardada y calculada sola!
                    </div>
                  )}

                  <form onSubmit={agregarVenta} className="form-stack">
                    <div className="form-group">
                      <label>Producto / Tamaño</label>
                      <select 
                        value={productoSeleccionadoId} 
                        onChange={e => handleProductoChange(e.target.value)}
                        className="form-input"
                      >
                        {productosCatalogo.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ({p.peso}) - ${p.precio.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Cantidad</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={nuevaCantidad} 
                          onChange={e => handleCantidadChange(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Precio Total ($)</label>
                        <input 
                          type="number" 
                          value={nuevoPrecio} 
                          readOnly
                          className="form-input readonly-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Medio de Pago</label>
                      <select 
                        value={nuevoPago} 
                        onChange={e => setNuevoPago(e.target.value)}
                        className="form-input"
                      >
                        <option>Transferencia</option>
                        <option>Efectivo</option>
                      </select>
                    </div>

                    <button type="submit" className="submit-btn">
                      Guardar Venta
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "ventas" && (
              <div className="card tab-content">
                <h3 className="section-title">Historial de Ventas</h3>
                {ventas.length === 0 ? (
                  <p className="empty-text">No hay ventas registradas todavía.</p>
                ) : (
                  <div className="sales-list">
                    {ventas.map(v => (
                      <div key={v.id} className="sale-item">
                        <div>
                          <p className="sale-product">{v.producto}</p>
                          <p className="sale-details">Cant: {v.cantidad} · {v.pago} · {v.fecha ? v.fecha.split('T')[0] : ''}</p>
                        </div>
                        <div className="sale-right">
                          <span className="sale-price">${Number(v.precio).toLocaleString()}</span>
                          <button onClick={() => eliminarVenta(v.id)} className="delete-btn">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CALENDARIO CON NAVEGACIÓN DE MESES */}
            {activeTab === "calendario" && (
              <div className="tab-content">
                <div className="card">
                  {/* Header de navegación de meses */}
                  <div className="cal-header-nav">
                    <button onClick={mesAnterior} className="cal-nav-btn">
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="section-title" style={{ margin: 0, textTransform: 'capitalize' }}>
                      {mesNombre} {year}
                    </h3>
                    <button onClick={mesSiguiente} className="cal-nav-btn">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <p className="section-desc" style={{ textAlign: 'center', marginTop: '4px' }}>Toca un día con ventas para ver el detalle.</p>
                  
                  <div className="calendar-weekdays" style={{ marginTop: '12px' }}>
                    <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                  </div>
                  <div className="calendar-grid">
                    {Array.from({ length: diasEnMes }).map((_, i) => {
                      const diaNum = i + 1;
                      const mesFormateado = String(month + 1).padStart(2, '0');
                      const diaFormateado = String(diaNum).padStart(2, '0');
                      const diaStr = `${year}-${mesFormateado}-${diaFormateado}`;
                      
                      const datosDia = ventasPorDia[diaStr];
                      const tieneVentas = datosDia && datosDia.total > 0;
                      const esSeleccionado = diaSeleccionado === diaStr;

                      return (
                        <div 
                          key={i} 
                          onClick={() => tieneVentas && setDiaSeleccionado(diaStr)}
                          className={`calendar-day ${tieneVentas ? 'has-sales' : ''} ${esSeleccionado ? 'selected' : ''}`}
                          style={{ cursor: tieneVentas ? 'pointer' : 'default' }}
                        >
                          <span className="cal-day-num">{diaNum}</span>
                          {tieneVentas && (
                            <span className="cal-day-total">
                              ${datosDia.total >= 1000 ? Math.round(datosDia.total / 1000) + 'k' : datosDia.total}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DETALLE DEL DÍA SELECCIONADO */}
                {diaSeleccionado && ventasPorDia[diaSeleccionado] && (
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 className="section-title" style={{ margin: 0 }}>Ventas del {diaSeleccionado}</h3>
                      <button onClick={() => setDiaSeleccionado(null)} className="delete-btn">
                        <X size={18} />
                      </button>
                    </div>
                    <p className="section-desc" style={{ marginBottom: '12px' }}>
                      Recaudación total: <strong>${ventasPorDia[diaSeleccionado].total.toLocaleString()}</strong>
                    </p>
                    
                    <div className="sales-list">
                      {ventasPorDia[diaSeleccionado].lista.map(v => (
                        <div key={v.id} className="sale-item">
                          <div>
                            <p className="sale-product">{v.producto}</p>
                            <p className="sale-details">Cant: {v.cantidad} · {v.pago}</p>
                          </div>
                          <span className="sale-price">${Number(v.precio).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "productos" && (
              <div className="tab-content">
                
                <div className="card">
                  <h3 className="section-title">
                    <Package size={20} /> Añadir Nuevo Producto
                  </h3>
                  
                  {mensajeExitoProd && (
                    <div className="success-alert">
                      <CheckCircle2 size={16} /> ¡Producto añadido al catálogo!
                    </div>
                  )}

                  <form onSubmit={agregarProducto} className="form-stack">
                    <div className="form-group">
                      <label>Nombre del Budín</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Budín de chocolate" 
                        value={nuevoNombreProd}
                        onChange={e => setNuevoNombreProd(e.target.value)}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Peso / Tamaño</label>
                        <input 
                          type="text" 
                          placeholder="Ej. 500g" 
                          value={nuevoPesoProd}
                          onChange={e => setNuevoPesoProd(e.target.value)}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Precio Base ($)</label>
                        <input 
                          type="number" 
                          placeholder="Ej. 8500" 
                          value={nuevoPrecioProd}
                          onChange={e => setNuevoPrecioProd(e.target.value)}
                          required
                          className="form-input"
                        />
                      </div>
                    </div>

                    <button type="submit" className="submit-btn">
                      Guardar Nuevo Producto
                    </button>
                  </form>
                </div>

                <div className="card">
                  <h3 className="section-title">Catálogo de Productos</h3>
                  <div className="sales-list">
                    {productosCatalogo.map(p => (
                      <div key={p.id} className="sale-item">
                        {editandoId === p.id ? (
                          <div className="edit-inline-form">
                            <input 
                              type="text" 
                              value={editNombre} 
                              onChange={e => setEditNombre(e.target.value)} 
                              className="form-input"
                            />
                            <div className="form-row-2">
                              <input 
                                type="text" 
                                value={editPeso} 
                                onChange={e => setEditPeso(e.target.value)} 
                                className="form-input"
                              />
                              <input 
                                type="number" 
                                value={editPrecio} 
                                onChange={e => setEditPrecio(e.target.value)} 
                                className="form-input"
                              />
                            </div>
                            <div className="edit-actions">
                              <button onClick={() => guardarEdicion(p.id)} className="action-icon-btn save">
                                <Check size={16} /> Guardar
                              </button>
                              <button onClick={() => setEditandoId(null)} className="action-icon-btn cancel">
                                <X size={16} /> Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="sale-product">{p.nombre} <span className="product-weight">({p.peso})</span></p>
                              <p className="sale-details">Precio base: ${Number(p.precio).toLocaleString()}</p>
                            </div>
                            <div className="sale-right">
                              <button onClick={() => iniciarEdicion(p)} className="edit-btn">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => eliminarProducto(p.id)} className="delete-btn">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="section-title">
                    <TrendingUp size={20} /> Porcentajes de Salida
                  </h3>
                  <p className="section-desc">Proporción de budines vendidos según tamaño y variedad.</p>
                  
                  <div className="progress-list">
                    {Object.entries(conteoProductos).length === 0 ? (
                      <p className="empty-text">Aún no hay ventas para calcular porcentajes.</p>
                    ) : (
                      Object.entries(conteoProductos).map(([prod, cant]) => {
                        const porcentaje = Math.round((cant / totalUnidades) * 100);
                        return (
                          <div key={prod} className="progress-item">
                            <div className="progress-info">
                              <span>{prod}</span>
                              <span className="progress-pct">{porcentaje}% ({cant} u.)</span>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${porcentaje}%` }}></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>

      <nav className="bottom-nav">
        <button onClick={() => setActiveTab("resumen")} className={`nav-btn ${activeTab === "resumen" ? "active" : ""}`}>
          <Home size={20} />
          <span>Resumen</span>
        </button>
        <button onClick={() => setActiveTab("ventas")} className={`nav-btn ${activeTab === "ventas" ? "active" : ""}`}>
          <ShoppingBag size={20} />
          <span>Ventas</span>
        </button>
        <button onClick={() => setActiveTab("calendario")} className={`nav-btn ${activeTab === "calendario" ? "active" : ""}`}>
          <CalendarIcon size={20} />
          <span>Calendario</span>
        </button>
        <button onClick={() => setActiveTab("productos")} className={`nav-btn ${activeTab === "productos" ? "active" : ""}`}>
          <Package size={20} />
          <span>Productos</span>
        </button>
      </nav>
    </div>
  );
}