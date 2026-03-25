package com.insuretrack.common.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

//
//public class GlobalExceptionHandler extends RuntimeException {
//    public GlobalExceptionHandler(String message) {
//        super(message);
//    }
//}
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (var err : ex.getBindingResult().getAllErrors()) {
            String field = ((FieldError) err).getField();
            errors.put(field, err.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception ex) {

        logger.error("Unhandled exception occurred", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Something went wrong");
    }


}
//package com.insuretrack.common.exception;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.validation.FieldError;
//import org.springframework.web.bind.MethodArgumentNotValidException;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.Map;
//
//@RestControllerAdvice
//public class GlobalExceptionHandler {
//
//    private static final Logger logger =
//            LoggerFactory.getLogger(GlobalExceptionHandler.class);
//
//    // ── Validation errors (@Valid annotations) → 400 with field map ─────────
//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
//        Map<String, String> errors = new HashMap<>();
//        for (var err : ex.getBindingResult().getAllErrors()) {
//            String field = ((FieldError) err).getField();
//            errors.put(field, err.getDefaultMessage());
//        }
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
//    }
//
//
//    @ExceptionHandler(RuntimeException.class)
//    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
//
//        String message = ex.getMessage() != null ? ex.getMessage() : "Unexpected error";
//        HttpStatus status;
//
//        // Map message keywords to HTTP status codes
//        String lower = message.toLowerCase();
//        if (lower.contains("not found")) {
//            status = HttpStatus.NOT_FOUND;                  // 404
//        } else if (lower.contains("already") || lower.contains("duplicate")) {
//            status = HttpStatus.CONFLICT;                   // 409
//        } else if (lower.contains("allowed only")
//                || lower.contains("must be")
//                || lower.contains("cannot be")
//                || lower.contains("cannot upload")
//                || lower.contains("exceeds")
//                || lower.contains("invalid")) {
//            status = HttpStatus.BAD_REQUEST;                // 400
//        } else {
//            status = HttpStatus.INTERNAL_SERVER_ERROR;      // 500
//        }
//
//        logger.error("RuntimeException [{}]: {}", status.value(), message);
//
//        Map<String, Object> body = new HashMap<>();
//        body.put("timestamp", LocalDateTime.now().toString());
//        body.put("status",    status.value());
//        body.put("error",     status.getReasonPhrase());
//        body.put("message",   message);
//
//        return ResponseEntity.status(status).body(body);
//    }
//
//    // ── ResourceNotFoundException (if you use it) → 404 ─────────────────────
//    @ExceptionHandler(ResourceNotFoundException.class)
//    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
//        Map<String, Object> body = new HashMap<>();
//        body.put("timestamp", LocalDateTime.now().toString());
//        body.put("status",    404);
//        body.put("error",     "Not Found");
//        body.put("message",   ex.getMessage());
//        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
//    }
//
//    // ── Catch-all for anything else → 500 ────────────────────────────────────
//    // Keep this LAST — Spring picks the most specific handler first
//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
//        logger.error("Unhandled exception occurred", ex);
//        Map<String, Object> body = new HashMap<>();
//        body.put("timestamp", LocalDateTime.now().toString());
//        body.put("status",    500);
//        body.put("error",     "Internal Server Error");
//        body.put("message",   "Something went wrong. Please try again.");
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
//    }
//}