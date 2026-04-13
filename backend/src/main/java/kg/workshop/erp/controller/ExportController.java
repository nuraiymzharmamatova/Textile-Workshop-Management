package kg.workshop.erp.controller;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.UnitValue;
import kg.workshop.erp.dto.response.SalaryResponse;
import kg.workshop.erp.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final EmployeeService employeeService;

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
            String[] headers = {"ФИО", "Тип", "Сшито", "Брак", "Ставка", "Итого"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            double total = 0;
            for (int i = 0; i < salaries.size(); i++) {
                SalaryResponse s = salaries.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(s.getEmployeeName());
                row.createCell(1).setCellValue("FIXED".equals(s.getSalaryType()) ? "Оклад" : "Сделка");
                row.createCell(2).setCellValue(s.getTotalSewn());
                row.createCell(3).setCellValue(s.getTotalDefective());
                row.createCell(4).setCellValue(s.getRatePerItem() != null ? s.getRatePerItem().doubleValue() : 0);
                row.createCell(5).setCellValue(s.getTotalSalary() != null ? s.getTotalSalary().doubleValue() : 0);
                total += s.getTotalSalary() != null ? s.getTotalSalary().doubleValue() : 0;
            }

            Row totalRow = sheet.createRow(salaries.size() + 1);
            totalRow.createCell(0).setCellValue("ИТОГО");
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

            doc.add(new Paragraph("Salary Report / Зарплатная ведомость").setFontSize(18).setBold());
            doc.add(new Paragraph("Period: " + ym).setFontSize(12));
            doc.add(new Paragraph(" "));

            Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1.5f, 1, 1, 1, 1.5f}));
            table.setWidth(UnitValue.createPercentValue(100));

            String[] headers = {"Name", "Type", "Sewn", "Defect", "Rate", "Total"};
            for (String h : headers) {
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
}
