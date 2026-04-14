package kg.workshop.erp.controller;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.UnitValue;
import kg.workshop.erp.dto.response.SalaryResponse;
import kg.workshop.erp.entity.Expense;
import kg.workshop.erp.entity.Order;
import kg.workshop.erp.enums.OrderStatus;
import kg.workshop.erp.repository.ExpenseRepository;
import kg.workshop.erp.repository.OrderRepository;
import kg.workshop.erp.repository.ProductionReportRepository;
import kg.workshop.erp.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final EmployeeService employeeService;
    private final OrderRepository orderRepository;
    private final ExpenseRepository expenseRepository;
    private final ProductionReportRepository productionReportRepository;

    // ============== SALARY EXPORT ==============

    @GetMapping("/salary/excel")
    public ResponseEntity<byte[]> exportSalaryExcel(@RequestParam(required = false) String month) {
        YearMonth ym = month != null ? YearMonth.parse(month) : YearMonth.now();
        List<SalaryResponse> salaries = employeeService.calculateSalaries(ym.atDay(1), ym.atEndOfMonth());

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Salary " + ym);
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row header = sheet.createRow(0);
            String[] headers = {"FIO", "Type", "Sewn", "Defect", "Rate", "Total"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]); cell.setCellStyle(headerStyle);
            }

            double total = 0;
            for (int i = 0; i < salaries.size(); i++) {
                SalaryResponse s = salaries.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(s.getEmployeeName());
                row.createCell(1).setCellValue("FIXED".equals(s.getSalaryType()) ? "Fixed" : "Piecework");
                row.createCell(2).setCellValue(s.getTotalSewn());
                row.createCell(3).setCellValue(s.getTotalDefective());
                row.createCell(4).setCellValue(s.getRatePerItem() != null ? s.getRatePerItem().doubleValue() : 0);
                row.createCell(5).setCellValue(s.getTotalSalary() != null ? s.getTotalSalary().doubleValue() : 0);
                total += s.getTotalSalary() != null ? s.getTotalSalary().doubleValue() : 0;
            }

            Row totalRow = sheet.createRow(salaries.size() + 1);
            totalRow.createCell(0).setCellValue("TOTAL");
            totalRow.createCell(5).setCellValue(total);

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=salary_" + ym + ".xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Export failed", e);
        }
    }

    @GetMapping("/salary/pdf")
    public ResponseEntity<byte[]> exportSalaryPdf(@RequestParam(required = false) String month) {
        YearMonth ym = month != null ? YearMonth.parse(month) : YearMonth.now();
        List<SalaryResponse> salaries = employeeService.calculateSalaries(ym.atDay(1), ym.atEndOfMonth());

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);

            doc.add(new Paragraph("Salary Report").setFontSize(18).setBold());
            doc.add(new Paragraph("Period: " + ym).setFontSize(12));
            doc.add(new Paragraph(" "));

            Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1.5f, 1, 1, 1, 1.5f}));
            table.setWidth(UnitValue.createPercentValue(100));
            for (String h : new String[]{"Name", "Type", "Sewn", "Defect", "Rate", "Total"}) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            }

            double total = 0;
            for (SalaryResponse s : salaries) {
                table.addCell(s.getEmployeeName());
                table.addCell("FIXED".equals(s.getSalaryType()) ? "Fixed" : "Piecework");
                table.addCell(String.valueOf(s.getTotalSewn()));
                table.addCell(String.valueOf(s.getTotalDefective()));
                table.addCell(s.getRatePerItem() != null ? s.getRatePerItem().toString() : "0");
                table.addCell(s.getTotalSalary() != null ? s.getTotalSalary().toString() : "0");
                total += s.getTotalSalary() != null ? s.getTotalSalary().doubleValue() : 0;
            }

            doc.add(table);
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("TOTAL: " + String.format("%.2f", total) + " som").setBold().setFontSize(14));
            doc.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=salary_" + ym + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("PDF export failed", e);
        }
    }

    // ============== FINANCIAL REPORT EXPORT ==============

    @GetMapping("/report/excel")
    public ResponseEntity<byte[]> exportReportExcel() {
        List<Order> allOrders = orderRepository.findAll();
        List<Expense> allExpenses = expenseRepository.findAll();

        BigDecimal revenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = allExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal profit = revenue.subtract(totalExpenses);

        int totalSewn = productionReportRepository.sumSewnByPeriod(LocalDate.of(2020, 1, 1), LocalDate.now());
        int totalDefective = productionReportRepository.sumDefectiveByPeriod(LocalDate.of(2020, 1, 1), LocalDate.now());

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            CellStyle bold = workbook.createCellStyle();
            Font font = workbook.createFont(); font.setBold(true); bold.setFont(font);

            // Sheet 1: Summary
            Sheet sum = workbook.createSheet("Summary");
            int row = 0;
            Row r = sum.createRow(row++); r.createCell(0).setCellValue("FINANCIAL REPORT"); r.getCell(0).setCellStyle(bold);
            sum.createRow(row++);
            r = sum.createRow(row++); r.createCell(0).setCellValue("Total Revenue"); r.createCell(1).setCellValue(revenue.doubleValue());
            r = sum.createRow(row++); r.createCell(0).setCellValue("Total Expenses"); r.createCell(1).setCellValue(totalExpenses.doubleValue());
            r = sum.createRow(row++); r.createCell(0).setCellValue("PROFIT"); r.getCell(0).setCellStyle(bold); r.createCell(1).setCellValue(profit.doubleValue());
            sum.createRow(row++);
            r = sum.createRow(row++); r.createCell(0).setCellValue("Total Orders"); r.createCell(1).setCellValue(allOrders.size());
            r = sum.createRow(row++); r.createCell(0).setCellValue("Completed Orders"); r.createCell(1).setCellValue(allOrders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count());
            r = sum.createRow(row++); r.createCell(0).setCellValue("Total Sewn"); r.createCell(1).setCellValue(totalSewn);
            r = sum.createRow(row++); r.createCell(0).setCellValue("Total Defective"); r.createCell(1).setCellValue(totalDefective);
            sum.autoSizeColumn(0); sum.autoSizeColumn(1);

            // Sheet 2: Orders
            Sheet ordersSheet = workbook.createSheet("Orders");
            Row oh = ordersSheet.createRow(0);
            String[] ohs = {"#", "Client", "Product", "Qty", "Total", "Status", "Deadline"};
            for (int i = 0; i < ohs.length; i++) { oh.createCell(i).setCellValue(ohs[i]); oh.getCell(i).setCellStyle(bold); }
            for (int i = 0; i < allOrders.size(); i++) {
                Order o = allOrders.get(i);
                Row or = ordersSheet.createRow(i + 1);
                or.createCell(0).setCellValue(o.getId());
                or.createCell(1).setCellValue(o.getClient() != null ? o.getClient().getName() : "");
                or.createCell(2).setCellValue(o.getProduct() != null ? o.getProduct().getName() : "");
                or.createCell(3).setCellValue(o.getQuantity());
                or.createCell(4).setCellValue(o.getTotalPrice() != null ? o.getTotalPrice().doubleValue() : 0);
                or.createCell(5).setCellValue(o.getStatus().name());
                or.createCell(6).setCellValue(o.getDeadline() != null ? o.getDeadline().toString() : "");
            }
            for (int i = 0; i < ohs.length; i++) ordersSheet.autoSizeColumn(i);

            // Sheet 3: Expenses
            Sheet expensesSheet = workbook.createSheet("Expenses");
            Row eh = expensesSheet.createRow(0);
            String[] ehs = {"Date", "Category", "Description", "Amount"};
            for (int i = 0; i < ehs.length; i++) { eh.createCell(i).setCellValue(ehs[i]); eh.getCell(i).setCellStyle(bold); }
            for (int i = 0; i < allExpenses.size(); i++) {
                Expense e = allExpenses.get(i);
                Row er = expensesSheet.createRow(i + 1);
                er.createCell(0).setCellValue(e.getExpenseDate().toString());
                er.createCell(1).setCellValue(e.getCategory());
                er.createCell(2).setCellValue(e.getDescription() != null ? e.getDescription() : "");
                er.createCell(3).setCellValue(e.getAmount().doubleValue());
            }
            for (int i = 0; i < ehs.length; i++) expensesSheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=financial_report.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Export failed", e);
        }
    }

    @GetMapping("/report/pdf")
    public ResponseEntity<byte[]> exportReportPdf() {
        List<Order> allOrders = orderRepository.findAll();
        List<Expense> allExpenses = expenseRepository.findAll();

        BigDecimal revenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = allExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal profit = revenue.subtract(totalExpenses);

        int totalSewn = productionReportRepository.sumSewnByPeriod(LocalDate.of(2020, 1, 1), LocalDate.now());
        int totalDefective = productionReportRepository.sumDefectiveByPeriod(LocalDate.of(2020, 1, 1), LocalDate.now());
        long completedCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count();

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);

            doc.add(new Paragraph("Financial Report").setFontSize(20).setBold());
            doc.add(new Paragraph("Generated: " + LocalDate.now()).setFontSize(10));
            doc.add(new Paragraph(" "));

            // Summary
            doc.add(new Paragraph("Summary").setFontSize(14).setBold());
            Table summary = new Table(UnitValue.createPercentArray(new float[]{2, 1}));
            summary.setWidth(UnitValue.createPercentValue(60));
            summary.addCell(new Cell().add(new Paragraph("Total Revenue")));
            summary.addCell(new Cell().add(new Paragraph(revenue + " som")));
            summary.addCell(new Cell().add(new Paragraph("Total Expenses")));
            summary.addCell(new Cell().add(new Paragraph(totalExpenses + " som")));
            summary.addCell(new Cell().add(new Paragraph("PROFIT").setBold()));
            summary.addCell(new Cell().add(new Paragraph(profit + " som").setBold()));
            summary.addCell(new Cell().add(new Paragraph("Total Orders")));
            summary.addCell(new Cell().add(new Paragraph(String.valueOf(allOrders.size()))));
            summary.addCell(new Cell().add(new Paragraph("Completed Orders")));
            summary.addCell(new Cell().add(new Paragraph(String.valueOf(completedCount))));
            summary.addCell(new Cell().add(new Paragraph("Total Sewn")));
            summary.addCell(new Cell().add(new Paragraph(totalSewn + " pcs")));
            summary.addCell(new Cell().add(new Paragraph("Defective")));
            summary.addCell(new Cell().add(new Paragraph(totalDefective + " pcs")));
            doc.add(summary);
            doc.add(new Paragraph(" "));

            // Orders table
            doc.add(new Paragraph("Orders").setFontSize(14).setBold());
            Table ordersTable = new Table(UnitValue.createPercentArray(new float[]{1, 2, 2, 1, 1.5f, 1.5f}));
            ordersTable.setWidth(UnitValue.createPercentValue(100));
            for (String h : new String[]{"#", "Client", "Product", "Qty", "Total", "Status"}) {
                ordersTable.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            }
            for (Order o : allOrders) {
                ordersTable.addCell(String.valueOf(o.getId()));
                ordersTable.addCell(o.getClient() != null ? o.getClient().getName() : "");
                ordersTable.addCell(o.getProduct() != null ? o.getProduct().getName() : "");
                ordersTable.addCell(String.valueOf(o.getQuantity()));
                ordersTable.addCell(o.getTotalPrice() != null ? o.getTotalPrice().toString() : "0");
                ordersTable.addCell(o.getStatus().name());
            }
            doc.add(ordersTable);
            doc.add(new Paragraph(" "));

            // Expenses table
            if (!allExpenses.isEmpty()) {
                doc.add(new Paragraph("Expenses").setFontSize(14).setBold());
                Table expTable = new Table(UnitValue.createPercentArray(new float[]{1.5f, 1.5f, 3, 1.5f}));
                expTable.setWidth(UnitValue.createPercentValue(100));
                for (String h : new String[]{"Date", "Category", "Description", "Amount"}) {
                    expTable.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
                }
                for (Expense e : allExpenses) {
                    expTable.addCell(e.getExpenseDate().toString());
                    expTable.addCell(e.getCategory());
                    expTable.addCell(e.getDescription() != null ? e.getDescription() : "");
                    expTable.addCell(e.getAmount() + " som");
                }
                doc.add(expTable);
            }

            doc.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=financial_report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("PDF export failed", e);
        }
    }
}
