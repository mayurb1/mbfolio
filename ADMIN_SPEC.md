# Admin Dashboard Specification

Based on the analysis of your personal portfolio frontend, here's a specification for building a simple, functional admin dashboard.

## 📋 Overview

**Purpose**: Simple admin interface to manage portfolio content including projects, contact form submissions, and basic settings.

**Tech Stack**: React + Formik + Tailwind CSS (extending your existing frontend architecture)

---

## 🎯 Core Features Required

### **1. Authentication**
- Admin login page
- Session management 
- Logout functionality

### **2. Dashboard Overview**
- Statistics cards showing totals
- Recent contact submissions preview
- Quick action buttons

### **3. Projects Management**
- List all projects in a table
- Search and filter projects
- Add new project form
- Edit existing project
- Delete project
- Toggle featured status
- Image upload for projects

### **4. Contact Form Management**  
- View all contact form submissions
- Mark submissions as read/unread
- Delete submissions
- Export to CSV
- View full message details

### **5. Media Management**
- Upload images
- View uploaded files in grid
- Delete unused files
- Basic file organization

### **6. Settings**
- Update basic site information
- Change admin password
- Theme preference (Light/Dark only)

---

## 🎨 Design System

### **Themes**
- **Light Theme**: White background with blue accents
- **Dark Theme**: Dark slate background with blue accents
- Simple theme toggle in header

### **Layout Structure**
```
├── Fixed Sidebar (250px width)
│   ├── Dashboard
│   ├── Projects  
│   ├── Contact Forms
│   ├── Media
│   └── Settings
├── Top Header Bar
│   ├── Page Title
│   ├── Theme Toggle  
│   └── User Menu
└── Main Content Area
    └── Page content with padding
```

### **Component Requirements**
- **Layout Components**: AdminLayout, Sidebar, Header
- **UI Components**: Button, DataTable, Modal, StatsCard
- **Form Components**: ProjectForm, LoginForm (using Formik)
- **Responsive**: Mobile-friendly with collapsible sidebar

---

## 📄 Page Specifications

### **1. Login Page**
- Clean centered login form
- Email and password fields
- Form validation with Formik + Yup
- Simple error handling

### **2. Dashboard Page**
- **Stats Section**: 4 cards showing totals (Projects, Messages, Media, Views)
- **Recent Activity**: List of last 5 contact form submissions
- **Quick Actions**: Buttons for common tasks

### **3. Projects Page**
- **Header**: Page title + "Add New Project" button
- **Filters**: Search input + Category dropdown
- **Projects Table**: 
  - Columns: Title, Category, Status, Featured, Actions
  - Actions: Edit, Delete buttons
  - Sortable columns
  - Pagination if needed
- **Add/Edit Modal**: Form with all project fields

### **4. Contact Forms Page**
- **Header**: Page title + "Export CSV" button
- **Submissions Table**:
  - Columns: Name, Email, Subject, Date, Status, Actions
  - Actions: View, Mark Read/Unread, Delete
  - Filter by status (New, Read, Archived)
- **View Modal**: Show full message details with action buttons

### **5. Media Page**
- **Upload Section**: Drag & drop or click to upload
- **Media Grid**: Thumbnails of uploaded images
- **File Actions**: Delete, View full size
- **Search/Filter**: By file type or upload date

### **6. Settings Page**
- **Site Settings**: Basic information form
- **Account Settings**: Change password form
- **Preferences**: Theme selection
- Simple forms using Formik

---

## 📱 Responsive Design

### **Desktop (lg+)**
- Fixed sidebar visible
- Full table layouts
- Multi-column forms

### **Tablet (md)**
- Sidebar remains visible
- Tables may scroll horizontally
- Responsive grid layouts

### **Mobile (sm)**
- Collapsible sidebar with hamburger menu
- Stacked form layouts
- Simplified tables
- Touch-friendly buttons

---

## 🗂️ Folder Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── StatsCard.jsx
│   │   └── forms/
│   │       ├── ProjectForm.jsx
│   │       └── LoginForm.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ContactForms.jsx
│   │   ├── Media.jsx
│   │   └── Settings.jsx
│   ├── services/
│   │   └── api.js
│   └── utils/
│       └── helpers.js
├── tailwind.config.js
└── package.json
```

---

## 🎯 Key Design Principles

### **Simplicity**
- Clean, functional interface
- No animations or fancy transitions
- Consistent spacing and typography

### **Functionality**
- Focus on core admin tasks
- Efficient workflows
- Clear action buttons

### **Consistency** 
- Reuse existing portfolio design tokens
- Consistent color scheme
- Standard form patterns using Formik

### **Accessibility**
- Proper contrast ratios
- Keyboard navigation
- Screen reader friendly

---

## 📋 Implementation Priority

### **Phase 1: Foundation**
1. Setup admin routing structure
2. Create basic layout components
3. Implement authentication flow

### **Phase 2: Core Features** 
1. Dashboard with stats
2. Projects management (full CRUD)
3. Contact forms viewing

### **Phase 3: Enhancement**
1. Media management
2. Settings page
3. Mobile responsiveness refinements

This specification provides a clear roadmap for building a simple, functional admin dashboard that extends your existing portfolio architecture.