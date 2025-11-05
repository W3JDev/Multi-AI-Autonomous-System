-- ============================================================================
-- Row-Level Security (RLS) Policies for W3JDev AI Ecosystem
-- ============================================================================
-- This file contains Supabase RLS policies for multi-tenant data isolation
-- Apply these policies after running Prisma migrations

-- ============================================================================
-- Enable RLS on All Tables
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE spa_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get current user's organization ID
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS TEXT AS $$
  SELECT organization_id::TEXT FROM users WHERE id = auth.uid()::TEXT;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is owner or admin
CREATE OR REPLACE FUNCTION auth.is_org_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::TEXT 
    AND role IN ('OWNER', 'ADMIN')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- Organizations Policies
-- ============================================================================

-- Users can view their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = auth.user_organization_id());

-- Only owners can update organization
CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (
    id = auth.user_organization_id() 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::TEXT 
      AND organization_id = organizations.id 
      AND role = 'OWNER'
    )
  );

-- ============================================================================
-- Users Policies
-- ============================================================================

-- Users can view users in their organization
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (organization_id = auth.user_organization_id());

-- Users can view and update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid()::TEXT);

-- Admins can create users in their organization
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

-- Admins can update users in their organization
CREATE POLICY "Admins can update org users"
  ON users FOR UPDATE
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

-- Admins can delete users in their organization
CREATE POLICY "Admins can delete org users"
  ON users FOR DELETE
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

-- ============================================================================
-- Subscriptions Policies
-- ============================================================================

CREATE POLICY "Users can view org subscription"
  ON subscriptions FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Owners can manage subscriptions"
  ON subscriptions FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

-- ============================================================================
-- Employees Policies (PUNCH-CLOCK)
-- ============================================================================

CREATE POLICY "Users can view org employees"
  ON employees FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage employees"
  ON employees FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

-- ============================================================================
-- Attendance Policies
-- ============================================================================

CREATE POLICY "Users can view org attendance"
  ON attendances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = attendances.employee_id 
      AND employees.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Employees can create own attendance"
  ON attendances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = attendances.employee_id 
      AND (
        employees.user_id = auth.uid()::TEXT 
        OR auth.is_org_admin()
      )
    )
  );

CREATE POLICY "Admins can manage attendance"
  ON attendances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = attendances.employee_id 
      AND employees.organization_id = auth.user_organization_id()
      AND auth.is_org_admin()
    )
  );

-- ============================================================================
-- Shifts Policies
-- ============================================================================

CREATE POLICY "Users can view org shifts"
  ON shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = shifts.employee_id 
      AND employees.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Admins can manage shifts"
  ON shifts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = shifts.employee_id 
      AND employees.organization_id = auth.user_organization_id()
      AND auth.is_org_admin()
    )
  );

-- ============================================================================
-- Leaves Policies
-- ============================================================================

CREATE POLICY "Users can view org leaves"
  ON leaves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = leaves.employee_id 
      AND employees.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Employees can create own leave requests"
  ON leaves FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = leaves.employee_id 
      AND employees.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Admins can manage leaves"
  ON leaves FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = leaves.employee_id 
      AND employees.organization_id = auth.user_organization_id()
      AND auth.is_org_admin()
    )
  );

-- ============================================================================
-- Payrolls Policies
-- ============================================================================

CREATE POLICY "Admins can view payrolls"
  ON payrolls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = payrolls.employee_id 
      AND employees.organization_id = auth.user_organization_id()
      AND auth.is_org_admin()
    )
  );

CREATE POLICY "Admins can manage payrolls"
  ON payrolls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = payrolls.employee_id 
      AND employees.organization_id = auth.user_organization_id()
      AND auth.is_org_admin()
    )
  );

-- ============================================================================
-- Restaurant Policies (WaiterAi/GuestAi)
-- ============================================================================

CREATE POLICY "Users can view org restaurants"
  ON restaurants FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage restaurants"
  ON restaurants FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

-- ============================================================================
-- Menu Policies
-- ============================================================================

CREATE POLICY "Users can view org menus"
  ON menus FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menus.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Admins can manage menus"
  ON menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menus.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
      AND auth.is_org_admin()
    )
  );

-- ============================================================================
-- Menu Items Policies
-- ============================================================================

CREATE POLICY "Users can view org menu items"
  ON menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Admins can manage menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
      AND auth.is_org_admin()
    )
  );

-- ============================================================================
-- Similar policies for Tables, Orders, OrderItems
-- ============================================================================

CREATE POLICY "Users can view org tables"
  ON tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = tables.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Members can manage tables"
  ON tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = tables.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can view org orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = orders.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Members can manage orders"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = orders.restaurant_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can view org order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN restaurants ON restaurants.id = orders.restaurant_id 
      WHERE orders.id = order_items.order_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Members can manage order items"
  ON order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN restaurants ON restaurants.id = orders.restaurant_id 
      WHERE orders.id = order_items.order_id 
      AND restaurants.organization_id = auth.user_organization_id()
    )
  );

-- ============================================================================
-- Training Programs Policies (FlairAi)
-- ============================================================================

CREATE POLICY "Users can view org training programs"
  ON training_programs FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage training programs"
  ON training_programs FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

-- ============================================================================
-- Staff Members, Sessions, Assessments Policies
-- ============================================================================

CREATE POLICY "Users can view org staff members"
  ON staff_members FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage staff members"
  ON staff_members FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

CREATE POLICY "Users can view org training sessions"
  ON training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_members 
      WHERE staff_members.id = training_sessions.staff_id 
      AND staff_members.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Staff can create own sessions"
  ON training_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_members 
      WHERE staff_members.id = training_sessions.staff_id 
      AND staff_members.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can view org assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_members 
      WHERE staff_members.id = assessments.staff_id 
      AND staff_members.organization_id = auth.user_organization_id()
    )
  );

-- ============================================================================
-- Resume Policies (Ai-Artisan)
-- ============================================================================

CREATE POLICY "Users can view org resumes"
  ON resumes FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can create own resumes"
  ON resumes FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id()
    AND user_id = auth.uid()::TEXT
  );

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (user_id = auth.uid()::TEXT);

-- ============================================================================
-- Cover Letters & Job Applications Policies
-- ============================================================================

CREATE POLICY "Users can view own cover letters"
  ON cover_letters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resumes 
      WHERE resumes.id = cover_letters.resume_id 
      AND resumes.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can manage own cover letters"
  ON cover_letters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM resumes 
      WHERE resumes.id = cover_letters.resume_id 
      AND resumes.user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can view own job applications"
  ON job_applications FOR SELECT
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can manage own job applications"
  ON job_applications FOR ALL
  USING (user_id = auth.uid()::TEXT);

-- ============================================================================
-- Spa Services & Appointments Policies (Serene-AI)
-- ============================================================================

CREATE POLICY "Users can view org spa services"
  ON spa_services FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage spa services"
  ON spa_services FOR ALL
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

CREATE POLICY "Users can view org appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spa_services 
      WHERE spa_services.id = appointments.service_id 
      AND spa_services.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Members can manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM spa_services 
      WHERE spa_services.id = appointments.service_id 
      AND spa_services.organization_id = auth.user_organization_id()
    )
  );

-- ============================================================================
-- Notifications Policies
-- ============================================================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

-- ============================================================================
-- Audit Logs Policies
-- ============================================================================

CREATE POLICY "Admins can view org audit logs"
  ON audit_logs FOR SELECT
  USING (
    organization_id = auth.user_organization_id()
    AND auth.is_org_admin()
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (organization_id = auth.user_organization_id());

-- ============================================================================
-- End of RLS Policies
-- ============================================================================
