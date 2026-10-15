# Controle de Ferramentas — aplicativo mobile

Este projeto foi montado em cima do `MeuProjeto` Expo que já estava dentro do projeto enviado.

## 1. Instalar dependências
Abra o terminal nesta pasta e rode:

```powershell
npm install
```

## 2. Configurar o endereço do Spring Boot
Abra:

`src/api.ts`

No celular físico, troque:

```ts
const DEVICE_IP = "192.168.1.100";
```

pelo IPv4 do computador que está rodando o Spring Boot.

Exemplo:

```ts
const DEVICE_IP = "192.168.1.15";
```

O celular e o computador precisam estar na mesma rede Wi-Fi.

## 3. Rodar o aplicativo

```powershell
npx expo start
```

Depois escaneie o QR Code pelo Expo Go.

## 4. Backend
O aplicativo usa os endpoints existentes:

- GET/POST `/usuarios`
- GET/POST `/ferramentas`
- GET/POST `/emprestimos`

Também usa:

- PUT `/emprestimos/{id}/devolver`

Para esse último botão funcionar, o controller do Spring precisa receber o método de devolução indicado abaixo.
