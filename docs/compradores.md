# Compradores (Buyers) Page

The Compradores page allows cooperatives to manage coffee buyers in the SigeCafe system.

## Accessing the Page

The Compradores page is accessible through the main navigation menu. The page is only accessible to users with the COOPERATIVA or ADMINISTRADOR roles.

## Features

### Viewing Buyers

The main view displays a table of all buyers (Associados with tipo="COMPRADOR") associated with the current user's cooperativa. The table includes the following information:

- ID
- Nome (Name)
- Celular (Phone number)
- Cidade (City)
- Estado (State)

The table supports:
- Searching for buyers by any field
- Sorting by clicking on column headers
- Pagination for handling large numbers of buyers

### Adding New Buyers

To add a new buyer:

1. Click the "Novo Comprador" button at the top of the table
2. Fill in the required fields in the form:
   - Nome (required)
   - Celular (optional)
   - Documento (CPF/CNPJ, optional)
   - Endereço (optional)
   - Cidade (optional)
   - Estado (optional)
3. Click "Salvar" to save the new buyer

### Viewing Buyer Details

To view the complete details of a buyer:

1. Locate the buyer in the table
2. Click the "Detalhes" button in the actions column
3. A modal will display with all buyer information, including the registration date

### Editing Buyers

To edit an existing buyer:

1. Locate the buyer in the table
2. Click the "Editar" button in the actions column
3. Modify the fields as needed in the form
4. Click "Atualizar" to save the changes

## API Integration

The Compradores page integrates with the following API endpoints:

- `GET /api/perfil` - To retrieve the current user's cooperativa ID
- `GET /api/associado/cooperativa/{id}?tipo=COMPRADOR` - To fetch all buyers for a specific cooperativa
- `POST /api/associado` - To create a new buyer
- `PUT /api/associado/{id}` - To update an existing buyer

## Technical Implementation

The page is implemented using Vue.js with the following components:

- UiDatatable - For displaying the table of buyers
- UiDialog - For modal forms and details views
- ClientOnly - To prevent hydration issues with client-side components

Type safety is ensured through TypeScript interfaces:
- AssociadoDTO
- AssociadoCreateDTO
- AssociadoUpdateDTO
- AssociadoCompleteDTO (extended to include timestamps)

## Error Handling

The page includes comprehensive error handling:
- Validation of required fields
- Graceful handling of API errors with clear user feedback
- Proper loading states during API calls