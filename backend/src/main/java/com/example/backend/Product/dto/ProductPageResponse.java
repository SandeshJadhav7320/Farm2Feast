package com.example.backend.Product.dto;

import java.util.List;

public class ProductPageResponse {

    private List<ProductResponse> content;
    private Long nextCursor;
    private boolean hasNext;

    public ProductPageResponse(
            List<ProductResponse> content,
            Long nextCursor,
            boolean hasNext) {

        this.content = content;
        this.nextCursor = nextCursor;
        this.hasNext = hasNext;
    }

    public List<ProductResponse> getContent() {
        return content;
    }

    public Long getNextCursor() {
        return nextCursor;
    }

    public boolean isHasNext() {
        return hasNext;
    }
}
