
# regenerar build

    rm -rf android/.cxx
    rm -rf android/app/.cxx
    rm -rf android/build
    rm -rf android/app/build
    rm -rf ~/.gradle/caches
    rm -rf android/app/.cxx
    rm -rf ~/.gradle/caches/9.0.0
    rm -rf ~/.gradle/kotlin
    rm -rf ~/.gradle/daemon
    rm -rf ~/.gradle/caches/modules-2/files-2.1
    # (opcional) si quieres forzar todo:
    rm -rf node_modules
    yarn install   # o npm install
    npm install --legacy-peer-deps


# 
cmd /c del /f /s /q "C:\Users\JesusVive\.gradle\caches\9.0.0\transforms\*"
cmd /c rd /s /q "C:\Users\JesusVive\.gradle\caches\9.0.0\transforms"

cmd /c del /f /s /q "C:\Users\JesusVive\.gradle\caches\9.0.0\fileHashes\*"
cmd /c rd /s /q "C:\Users\JesusVive\.gradle\caches\9.0.0\fileHashes"

cmd /c del /f /s /q "C:\Users\JesusVive\.gradle\daemon\*"
cmd /c rd /s /q "C:\Users\JesusVive\.gradle\daemon"


  cmd /c rd /s /q "C:\ed\PulsoCop\android\.gradle"
  cmd /c rd /s /q "C:\ed\PulsoCop\android\.cxx"
  cmd /c rd /s /q "C:\ed\PulsoCop\android\app\.cxx"
  cmd /c rd /s /q "C:\ed\PulsoCop\android\build"
  cmd /c rd /s /q "C:\ed\PulsoCop\android\app\build"


# opcional (limpieza total)
  Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
  yarn install   # o npm install
  npm install --legacy-peer-deps


# Generar apk

cd android
./gradlew clean
./gradlew assembleRelease


# Generar bundle
cd android
./gradlew clean
./gradlew bundleRelease


# debug
adb logcat | grep -i negocio




# logs
npx react-native log-android | sed -n '1,120p'


/home/zeroed/my-release-key.keystore



# release version
keytool -genkey -v -keystore ~/my-release-key.keystore -alias panalbee_key -keyalg RSA -keysize 2048 -validity 10000


# keytool -genkey -v -keystore ~/my-release-key.keystore -alias panalbee_key -keyalg RSA -keysize 2048 -validity 10000


# to firebase
keytool -list -v -keystore ~/my-release-key.keystore -alias panalbee_key


# copiar keys al proyecto
# desde la raíz del repo (opcional)
cp ~/my-release-key.keystore android/app/my-release-key.keystore

# añade estas líneas a android/gradle.properties (edítalas con tus contraseñas)
cat >> android/gradle.properties <<EOF
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=panalbee_key
MYAPP_UPLOAD_STORE_PASSWORD=tu_store_password
MYAPP_UPLOAD_KEY_PASSWORD=tu_key_password
EOF




# Remove the android build folders
rm -rf android/app/build
rm -rf android/build

# Remove the specific native build cache for nitro-modules
rm -rf node_modules/react-native-nitro-modules/android/.cxx
rm -rf node_modules/react-native-nitro-modules/android/build



# versionamiento
PanalbeeMobile/android/app/build.gradle





# para publicar

# https://console.cloud.google.com/
# IAM & Admin → Service Accounts
# Create Service Account
# pulsocop-play-verifier
# Keys → Add Key → Create new key

export GOOGLE_APPLICATION_CREDENTIALS_MINACOP=/home/zeroed/Coder/businesses/businesses-backend/secrets/google-service-account-pulsocop.json


zeroed@zero-ed-coder:~/Coder/PanalbeeMobile/android/app/build/outputs/apk/release$ adb -s 4f80d2bb uninstall com.panalbeemobile
Success
zeroed@zero-ed-coder:~/Coder/PanalbeeMobile/android/app/build/outputs/apk/release$ adb -s 4f80d2bb install -r app-release.apk




# install apk -> carpeta donde queda la apk
cd PanalbeeMobile/android/app/build/outputs/apk/release



# lista dispositivos
adb devices

# reemplaza la anterios
adb install -r app-release.apk

adb -s 4f80d2bb uninstall com.panalbeemobile

adb -s 4f80d2bb install -r app-release.apk


# copy all files of a module

find ~/Coder/businesses/pulsoCop/src/modules/payables -type f -exec cat {} + >> payables-mobile.txt

find ~/Coder/businesses/businesses-backend/src/payables -type f -exec cat {} + >> payables-backend.txt


find ~/Coder/businesses/pulsocop-web/src/modules/payables -type f -exec cat {} + >> payables-web.txt


warehouse/inventario
warehouse/entradas
warehouse/salidas

operations/expenses


Vamos a implementar  el componente  de ImageUpload
pulsocop-web/src/modules/general-expenses/components/GeneralExpenseModal.tsx
pulsocop-web/src/modules/products/components/ImageUpload.tsx

1. Donde se registran los gastos de las operations
pulsocop-web/src/modules/operations/components/CreateLavadaExpenseModal.tsx

2. En todas las partes donde se usan las imagenes 
pulsocop-web/src/modules/warehouse/

No alucines y verifica que todo quede bien en un check list al finalizar




Así como este componente
pulsocop-web/src/components/ImageViewerModal.tsx
 debe implementarse en pulsocop-web/src/modules/operations/components/LavadaExpenseCard.tsx

 Un icono de react-lucide que haga referencia a la imagen
Este es el objeto que se recibe



Vamos a crear un componente de time range selector como el que tenemos aqui
pulsoCop/src/modules/analytics/components/TimeRangeSelector.tsx

Lo crearemos en la siguiente ruta
pulsocop-web/src/components/TimeRangeSelector.tsx

Y lo vamos a implementar como se implementa aqui
pulsoCop/src/modules/operations/screens/LavadasScreen.tsx


Ahora luego de eso vamos a empezar con la implementacion de este aqui

pulsocop-web/src/app/(protected)/payables/page.tsx 

No aluciones y revisa el check list antes de finalizar

Recurda que eres un experto en paridad funcional
Si lo requieres pulsoCop/src/modules puedes buscar como se implementa en esos modulos.


El time range selector  que implementamos aqui
pulsocop-web/src/components/TimeRangeSelector.tsx

Esta implementado aqui
pulsocop-web/src/app/(protected)/payables/page.tsx 
pulsocop-web/src/modules/payables/

Aqui también está implementado, pero lo podemos mejorar en funcion a la primera implementacion
pulsocop-web/src/app/(protected)/operations/page.tsx 
pulsocop-web/src/modules/operations/

No alucines y revisa el check list antes de finalizar
Toca solo lo necesario, no crees estilos adicionales.





pulsocop-web/src/app/(protected)/payables/page.tsx 
Todo en el mismo formato que aqui
pulsocop-web/src/app/(protected)/payables/page.tsx 

Vamos a implementarlo aqui tambien
pulsocop-web/src/app/(protected)/purchase-orders/page.tsx
pulsocop-web/src/app/(protected)/warehouses/page.tsx
pulsocop-web/src/app/(protected)/accounts/page.tsx




Buscando  la paridad funcional entre pulsoCop y pulsocop-web
Tenemos que 
pulsoCop/src/components/menu/AppMenu.tsx
Esta implementado el menu lateral

Vamos a implementar la misma linea de diseño, iconos y estilos aqui 
pulsocop-web/src/components/SideNav.tsx

Aqui agrega alguna mejora si lo ves conveniente
pulsocop-web/src/app/(protected)/layout.tsx


Vamos a implementar el comportamiento y los permisos de los usuarios
para cada item.
Revisa
pulsoCop/src/stores/auth.store.ts
E implementa todo lo necesario en
pulsocop-web/src/stores/auth.store.ts
Para cummplir con el comportamiento

Recuerda la importancia de la paridad.
Debe ser lo mas parecido posible.
No alucines y revisa el check list antes de finalizar




pulsoCop/src/modules/operations/screens/LavadaDetailScreen.tsx
Tiene implementado este header que habla de la cantidad de oro producido
La suma de los minutos de las paradas creadas y el acumulado de los gastos
pulsoCop/src/modules/operations/screens/LavadaDetailHeader.tsx

Necesito que revises bien esto
pulsoCop/src/modules/operations

Ahora para que esto funcione debe haber paridad funcional con 
pulsocop-web/src/app/(protected)/operations/[operationId]/page.tsx

Meojora los estilos de 
pulsocop-web/src/modules/general-expenses/
Sobre todo usa las cards como refencia 
Y mejora todas las cards
Y la apariencia de los componentes que consideres necesario
De aqui
pulsocop-web/src/modules/operations/components/

No alucines y revisa el check list antes de finalizar y manten la estructura de styles usando styled components como ya se usa



    { href: '/purchase-orders', label: 'Pedidos de Compra' },
    { href: '/products', label: 'Productos' },
    { href: '/suppliers', label: 'Proveedores' },
    { href: '/products/create', label: 'Crear Producto' },
    { href: '/accounts', label: 'Cuentas' },



Ahora vas a revisar todos los modulos de
businesses-backend/src/
Y vamos a crear un endpoint que elibusiness con barrido completo en mongodb
todo lo que hace referencia a una negocio.
Que no vas a elinegocior:
  users, accounts
Y vamos a colocar ese boton en la pantalla de businesses
pulsocop-web/src/app/(protected)/businesses/[businessId]/page.tsx

Ese endpoint debe ser llamado desde el frontend
y debe confirmarse con una contraseña, la contraseña será la fecha del dia de hoy en formato ddmmyyyy

Y obviamente debe haber un modal para confirmar la contraseña y si esta seguro, se elinará en un conteo de 10 segundos.
usa como linea de styles pulsocop-web/src/modules/general-expenses/


Entonces, va a al backend a verificar que va a elinegocior, viene al frontend, y luego procede a elinegocior con contraseña.
Debe venir desde el backend un check antes de elinegocior.
No alucines y revisa el check list antes de finalizar







Aqui

businesses-backend/src/accounts/constants/account-permissions.constants.ts
Nesceitamos otro permiso que se llame  ADMIN_ACCOUNTS

Este permiso es muy importante porque va a permitir que el usuario pueda ver todas las cuentas

pulsocop-web/src/app/(protected)/layout.tsx

Esta ruta debe estar protegida por este permiso
pulsocop-web/src/app/(protected)/accounts/page.tsx

Debe tener un redirect a otra ruta y no debe aparecer la opcion disponble en el menu

No alucines y revisa el check list antes de finalizar




Ahora vas a revisar todos los modulos de
businesses-backend/src/
Luego vas a hacer enfasis en 
businesses-backend/src/accounts
businesses-backend/src/capabilities
businesses-backend/src/roles
businesses-backend/src/users
Aqui están los permisos y los roles.

Necesito unos permisos o capacidades que tengan que ver directamente con
el account, es decir con el modelo, la collection, el documento
puntual.

Yo debería atraves de 
pulsocop-web/src/app/(protected)/accounts/page.tsx
pulsocop-web/src/modules/accounts/
pulsocop-web/src/modules/accounts-admin/components/AccountPlanModal.tsx
En el modal debería tambien poder agregar o quitar esos permisos a la cuenta.
Por ejemplo un permiso importante y que solo se debe dar por ahi
es la elinegocioción de una negocio completa.

pulsocop-web/src/modules/businesses
pulsocop-web/src/app/(protected)/businesses/[businessId]/page.tsx

En el backend 
businesses-backend/src/businesses

Entonces, esos permisos se debe fusionar en el backend en 
businesses-backend/src/auth/auth.service.ts
en el metodo "me"


Esos permisos tambien deberían existir en alguna costante,
para listarlos desde el backend hacia el frontend

podrían estar aqui como los otros, pero deben hacer refencia cuentas puntuales
"""
businesses-backend/src/accounts
"""

No alucines y revisa el check list antes de finalizar





Revisa bien lo que hay aqui
pulsoCop/src/stores/
pulsoCop/src/modules/operations/


Este es importante porque aqui se setea la negocio y el historical
pulsoCop/src/modules/businesses

Y has los cambios necesarios para que los stats funcionen correctamente
aqui 




# prompt para replicar modulos


Necesitamos un prompt para Cloud Sonnet con lo siguiente:

Rol: Actúa como un Principal Software Engineer & System Architect. Tu especialidad es la Paridad Funcional y la migración de lógica entre plataformas (Mobile-to-Web).

VARIABLES:
PROJECT_BACKEND: businesses-backend
PROJECT_WEB: pulsocop-web
PROJECT_MOBILE: pulsoCop

PROJECT_TO_WORK: PROJECT_WEB
PROJECT_TO_REPLICATE: PROJECT_MOBILE

PATH_TO_WORK: pulsocop-web/src/modules/operations, pulsoCop/src/modules/operation-expenses, pulsoCop/src/modules/downtimes
PATH_TO_REPLICATE: pulsoCop/src/modules/operations
PATH_TO_BACKEND: businesses-backend/src/operations, businesses-backend/src/operation-expenses, businesses-backend/src/downtimes, 


STYLES_LINE: pulsocop-web/src/modules/general-expenses

Necesito que repliques en PATH_TO_WORK todos las funcionalidades de PATH_TO_REPLICATE, revisa todos los hooks y crea esos hooks en PATH_TO_WORK
e implementa los componentes en PATH_TO_WORK

Aqui falta revisar
pulsoCop/src/modules/settlements
Que contiene el calculo de la liquidacion e implementarlo en PROJECT_TO_WORK

Y que revises todos los endpoints de PATH_TO_BACKEND y que los implementes en PATH_TO_WORK
Siguiendo toda la linea de estilos de STYLES_LINE

Crea el check list de todas las funcionalidades replicadas desde el PATH_TO_REPLICATE a el PATH_TO_WORK




# Prompt para mejorar -> Frontend


Necesitamos un prompt para Cloud Sonnet con lo siguiente:
En el proyecto pulsocop-web
Toma como linea de estilos y estructura 
    pulsocop-web/src/modules/general-expenses 
    pulsocop-web/src/modules/warehouses
    
    
Ahora vas a a modificar el modulo de  pulsocop-web/src/modules/wallets
Solo los estilos vas a modificar los estilos y vas a revisar que no se esté perdiendo ninguna funcionalidad 
Si consideras que hay que mejorar algo, hazlo pero no pierdas ninguna funcionalidad.
Siempre pensando en la app como algo futurista y con excelente experiencia de usuario.
Y las mejores practicas de react y nextjs.

Esta es la parte clave: Vas a revisar en este proyecto como funciona y vas a verificar que no se esté perdiendo ninguna funcionalidad aqui en el modulo
mobile /pulsoCop/modules/wallets encontraras todas las funcionalidades, porque hay funcionalidades incompletas, se debe comportar exactamente igual que en su modulo mobile:

Y este es su backend businesses-backend/src/wallets para que revises que todos los endpoints estén bien implementados.

Dame este prompt  para Cloud Sonnet  y evita que se ponga creativo y que no alucine, se incisivo en eso y que no pierda funcionalidades.

Crea el check list para no alucinar




Prompt para Cloud Sonnet (copiar/pegar) — Plantilla base (instanciada para WALLETs)



#### 
Aquí tienes una versión más clara y coherente, manteniendo tu intención pero ordenando responsabilidades y flujo:

---

### Prompt mejorado

Vamos a implementar una funcionalidad de **elinegocioción total de una negocio**.

#### 1. Backend

Revisa todos los módulos dentro de:

`businesses-backend/src/`

Debes crear un endpoint que realice un **barrido completo en MongoDB** elinegociondo toda la información relacionada con una negocio.

**Restricciones:**
No se deben elinegocior bajo ninguna circunstancia:

* `users`
* `accounts`

El endpoint no debe elinegocior directamente al primer llamado.

Debe funcionar en dos fases:

1. **Fase de verificación (preview)**
   El backend analiza todas las colecciones y responde qué documentos serán elinegociodos.
   Debe devolver un checklist estructurado por colección con conteo de registros.

2. **Fase de ejecución (delete)**
   Solo después de confirmar la contraseña correcta, ejecuta el borrado definitivo.

La contraseña requerida será:

> la fecha actual en formato `ddmmyyyy`

---

#### 2. Frontend

Archivo:

`pulsocop-web/src/app/(protected)/businesses/[businessId]/page.tsx`

Debes agregar un botón **Elinegocior negocio**.

Flujo UI:

1. El usuario presiona el botón
2. Se abre un modal
3. El frontend solicita al backend la fase de verificación
4. El modal muestra el checklist de lo que se elinegociorá
5. El usuario debe escribir la contraseña
6. Al confirmar, inicia un conteo regresivo de 10 segundos
7. Si no cancela, se ejecuta la elinegocioción definitiva

Usar como referencia de estilos:

`pulsocop-web/src/modules/general-expenses/`

---

#### Reglas importantes

* El frontend nunca elinegocio sin antes recibir el checklist del backend
* El backend nunca elinegocio sin contraseña válida
* No asumir relaciones: inspeccionar realmente los módulos antes de programar
* Verificar el checklist antes de finalizar la implementación
* No inventar modelos ni colecciones

---

Esto deja el flujo lógico:

**Backend analiza → Frontend muestra → Usuario confirma → Backend elinegocio**




Eres un asistente de ingeniería senior. Tu tarea es mejorar **estilos/UX** del módulo web objetivo y **corregir/ternegocior funcionalidades faltantes** para que el módulo web se comporte **exactamente** como su equivalente móvil, consumiendo el backend ya implementado.

NO inventes features. NO “rellenes” vacíos con suposiciones. NO hagas refactors grandes. Cambios mínimos, enfocados y seguros.
Si algo no está en el código (backend o móvil), escribe literalmente: **“NO ENCONTRADO”** y NO lo implementes.

========================================================
0) VARIABLES (para reutilizar este prompt en otros módulos)
- WEB_PROJECT: pulsocop-web
- WEB_TARGET_MODULE: src/modules/wallets
- WEB_STYLE_BASELINE_MODULES:
  - src/modules/general-expenses
  - src/modules/warehouses
- MOBILE_SOURCE_OF_TRUTH_MODULE: pulsoCop/modules/wallets
- BACKEND_SOURCE_OF_TRUTH_MODULE: businesses-backend/src/wallets
- MINE_CONTEXT_RULE: “Si el feature depende de negocio, debe usar la negocio activa (activeBusiness) del store web”.

========================================================
1) ALCANCE Y ORDEN OBLIGATORIO (no te saltes pasos)

A) Inspección de Backend (SOLO lectura)
- Entra a: businesses-backend/src/wallets
- Recorre y revisa TODOS los archivos del módulo (controller/service/dto/schemas/types).
- Confirma endpoints y shapes (no modifiques backend):
  - GET  /wallets/me  -> lista wallets del usuario. :contentReference[oaicite:0]{index=0}
  - POST /wallets/activate -> activa sistema y retorna lista. :contentReference[oaicite:1]{index=1}
- Confirma tipos:
  - WalletType: PERSONAL | MINE | SAVINGS | INVESTMENT. :contentReference[oaicite:2]{index=2}
  - MINE wallet tiene businessId opcional (asociado a una negocio). :contentReference[oaicite:3]{index=3}
  - activateWallets crea PERSONAL + 1 MINE por cada negocio del usuario + SAVINGS + INVESTMENT y luego lista. :contentReference[oaicite:4]{index=4}

B) Inspección de Móvil (FUENTE DE VERDAD funcional)
- Entra a: pulsoCop/modules/wallets
- Recorre TODOS los archivos (screens/components/hooks/services/types).
- Extrae la lista completa de funcionalidades (sin agregar pantallas nuevas).
- Comportamiento mínimo que web debe igualar:
  - “Mis finanzas” (header + copy: “Sistema económico personal”). :contentReference[oaicite:5]{index=5}
  - Si NO hay wallets: mostrar CTA “Activar sistema financiero” y ejecutar activate(). :contentReference[oaicite:6]{index=6}
  - Si SÍ hay wallets: renderizar lista (FlatList) con WalletCard. :contentReference[oaicite:7]{index=7}
  - API móvil:
    - listMyWallets() => GET /wallets/me. :contentReference[oaicite:8]{index=8}
    - activateWallets() => POST /wallets/activate. :contentReference[oaicite:9]{index=9}
  - React Query en móvil:
    - queryKey: ['my-wallets']. :contentReference[oaicite:10]{index=10}
    - al activar: invalidate ['me'] y ['my-wallets']. :contentReference[oaicite:11]{index=11}
  - WalletCard:
    - navega a “Movements” pasando { wallet }. :contentReference[oaicite:12]{index=12}
    - muestra type, name, balance y color por tipo (MINE/SAVINGS/INVESTMENT/default). :contentReference[oaicite:13]{index=13}

C) Inspección de Web (estructura + estilos)
- Entra a: pulsocop-web/src/modules/general-expenses y pulsocop-web/src/modules/warehouses
  - Son la línea de estilos: spacing, card look, headers, empty states, buttons, modals.
- Entra a: pulsocop-web/src/modules/wallets
  - No asumas nada: revisa qué existe, qué falta, y qué está a medias.
- Si aplica “MINE_CONTEXT_RULE”:
  - Usa activeBusiness del store web para seleccionar la wallet tipo MINE correspondiente (businessId == activeBusinessId), SIN alterar el resto del comportamiento del móvil.

========================================================
2) OBJETIVO EXACTO (WALLETs)
En pulsocop-web/src/modules/wallets:
1) Mejorar SOLO estilos/UX (futurista, limpio, consistente con general-expenses/warehouses).
2) Completar/corregir funcionalidades faltantes para que el módulo web se comporte igual que móvil:
   - lista wallets (GET /wallets/me)
   - estado “sin sistema” + botón activar (POST /wallets/activate)
   - invalidaciones y refrescos tras activar (equivalente a móvil)
   - navegación a movimientos por wallet (si existe pantalla/ruta equivalente; si NO existe, “NO ENCONTRADO” y no inventes rutas)
3) NO romper nada existente: routing, stores, estilos globales, librerías.

========================================================
3) REGLAS DURAS (anti-alucinación)
- Prohibido:
  - inventar endpoints (solo /wallets/me y /wallets/activate confirmados).
  - inventar pantallas o rutas nuevas “porque suena lógico”.
  - cambiar arquitectura global, mover carpetas, renombrar rutas existentes.
  - introducir nuevas librerías.
- Permitido SOLO si es necesario:
  - crear componentes locales dentro del módulo wallets.
  - ajustar un store únicamente si ya existe patrón en el proyecto y es mínimo.
- Si una funcionalidad del móvil no tiene equivalente web:
  - NO la inventes; reporta “NO ENCONTRADO” y deja nota.

========================================================
4) PLAN DE EJECUCIÓN OBLIGATORIO (sin saltos)
1) Haz inventario en WEB wallets: archivos, pantallas, hooks, services, types, rutas.
2) Haz inventario en MOBILE wallets: lista exacta de features y flujo.
3) Haz “Parity Checklist” (tabla mental o lista) móvil vs web:
   - qué existe igual
   - qué falta
   - qué está incompleto
4) Implementa cambios en este orden:
   a) Services API web (alineados a backend).
   b) Hooks React Query web (keys/invalidation equivalentes al móvil).
   c) UI (empty state, CTA activar, lista wallets, card).
   d) Business-context (si aplica): filtrar/seleccionar wallet MINE por activeBusiness sin cambiar lo demás.
   e) Estilos: ajustar cards, headers, spacing, estados vacíos, consistencia visual.
5) Validación final con checklist (abajo).

========================================================
5) ENTREGABLES (formato de salida)
- Lista de archivos creados/modificados (con rutas).
- Por cada archivo: resumen breve de cambios.
- Notas de incompatibilidades encontradas (backend vs móvil vs web) sin soluciones grandes, solo ajustes mínimos.

========================================================
6) CHECKLIST FINAL (si no puedes marcar algo, explica por qué)
[ ] Web: puedo entrar al módulo “Finanzas/Mis finanzas”.
[ ] Web: si NO hay wallets, veo CTA “Activar sistema financiero” y funciona.
[ ] Web: al activar, se refresca la lista (equivalente a invalidar ['me'] y ['my-wallets']). :contentReference[oaicite:14]{index=14}
[ ] Web: si SÍ hay wallets, veo lista con cards (type, name, balance) consistente con móvil. :contentReference[oaicite:15]{index=15}
[ ] Web: los datos salen de GET /wallets/me. :contentReference[oaicite:16]{index=16}
[ ] Web: activar usa POST /wallets/activate. :contentReference[oaicite:17]{index=17}
[ ] Web: si existe pantalla/ruta de movimientos, navegar desde card con el wallet seleccionado; si no existe, reporté “NO ENCONTRADO” (sin inventar). :contentReference[oaicite:18]{index=18}
[ ] Business-context (si aplica): la wallet tipo MINE corresponde a activeBusiness (businessId==activeBusinessId) sin romper el resto.
[ ] No se tocaron módulos no relacionados.
[ ] Cambios mínimos: solo wallets + lo estrictamente necesario para parity.

Fin del prompt.
`





Para que **Claude 3.5 Sonnet** (o cualquier modelo de razonamiento avanzado como Gemini 1.5 Pro) no "alucine" y se mantenga fiel a tu código, el prompt debe ser **declarativo y restrictivo**.

Aquí tienes la estructura profesional optimizada para usarla como plantilla:

---

## 🚀 Plantilla de Prompt Maestro (Copy-Paste)

**Rol:** Actúa como Ingeniero de Software Senior especializado en React, Next.js y Diseño de Sistemas de Alta Fidelidad.

**Contexto del Proyecto:**
Estoy trabajando en el ecosistema `pulsocop-web`. El objetivo es refactorizar visualmente el módulo de **Wallets** manteniendo una paridad de funciones estricta con el backend y la versión móvil.

**1. Referencias de Estilo y Estructura (Baseline):**
Utiliza los siguientes directorios como verdad absoluta para la arquitectura de componentes y patrones de diseño:

* `pulsocop-web/src/modules/general-expenses`
* `pulsocop-web/src/modules/warehouses`

**2. Objetivo de la Tarea:**
Modifica el módulo `pulsocop-web/src/modules/wallets` aplicando:

* **Diseño Futurista:** UX impecable, interfaces limpias y modernas.
* **Refactorización Estética:** Actualiza estilos sin romper el DOM ni la lógica de negocio.
* **Mejores Prácticas:** Implementa Clean Code en React/Next.js.

**3. Análisis de Funcionalidad (Fuentes de Verdad):**
No asumas comportamientos. Debes validar la lógica contra:

* **Lógica de Negocio:** Revisa `mobile/pulsoCop/modules/wallets`. Si el módulo web actual tiene funciones incompletas, replícalas EXACTAMENTE como están en mobile.
* **Integración de Datos:** Valida cada endpoint contra el código del backend en `businesses-backend/src/wallets`. Asegúrate de que los tipos, métodos (GET, POST, etc.) y payloads sean correctos.

**4. Restricciones Anti-Alucinación (Crítico):**

* **Prohibido crear código ficticio:** Si falta un endpoint en el backend o una lógica en mobile, pregunta o indícalo, pero no inventes respuestas.
* **Preservación de Estado:** No elibusinesses `useEffect`, `useContext` o handlers de eventos existentes a menos que los estés optimizando. La funcionalidad debe ser idéntica o superior.
* **Verificación Cruzada:** Antes de escribir código, mapea mentalmente la relación *Frontend-Mobile-Backend*.

---

## ✅ Check-list de Validación Anti-Alucinación

*Para que se lo pidas a la IA antes de que te entregue el código final.*

Pide a Claude que marque estos puntos antes de responder:

1. [ ] **Mapeo de Endpoints:** ¿Coinciden los servicios de `wallets` con las rutas definidas en `businesses-backend/src/wallets`?
2. [ ] **Paridad Mobile:** ¿Se han implementado las funciones que faltaban en web pero existen en `pulsoCop/modules/wallets`?
3. [ ] **Consistencia de Estilos:** ¿El nuevo diseño utiliza los mismos tokens de diseño (colores, espaciado) que `general-expenses`?
4. [ ] **Integridad Funcional:** ¿Se han mantenido todos los manejadores de errores y estados de carga (loading states) existentes?
5. [ ] **Cero Código "Placeholder":** ¿He evitado usar comentarios como `// implementar después` o funciones vacías?

---

### ¿Por qué esta estructura funciona mejor?

1. **Jerarquía de Información:** Separa las referencias (lo que debe copiar) de las tareas (lo que debe hacer).
2. **Fuentes de Verdad:** Al mencionar el backend y el código mobile, le cierras la puerta a que "invente" cómo debería funcionar una función.
3. **Instrucciones Negativas:** Las IA responden muy bien a restricciones explícitas (ej: "Prohibido crear código ficticio").
4. **Check-list:** Obligar a la IA a seguir una lista de verificación reduce la probabilidad de que se salte pasos por ahorrar tokens.

¿Te gustaría que te ayude a adaptar este prompt específicamente para **Gemini CLI** (que permite adjuntar los archivos automáticamente) o prefieres seguir con **Claude**?