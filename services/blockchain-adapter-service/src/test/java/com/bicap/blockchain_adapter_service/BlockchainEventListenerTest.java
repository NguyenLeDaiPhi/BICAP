package com.bicap.blockchain_adapter_service;

import com.bicap.blockchain_adapter_service.config.BlockchainEventListener;
import com.bicap.blockchain_adapter_service.dto.BlockchainMessage;
import com.bicap.blockchain_adapter_service.dto.BlockchainResult;
import com.bicap.blockchain_adapter_service.entity.BlockchainRecord;
import com.bicap.blockchain_adapter_service.service.IBlockchainService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BlockchainEventListenerTest {
    @Test
    void repliesWithTransactionFromThisWriteWhenResourceIdsOverlap() {
        IBlockchainService service = mock(IBlockchainService.class);
        RabbitTemplate rabbit = mock(RabbitTemplate.class);
        BlockchainEventListener listener = new BlockchainEventListener(service, rabbit);
        ReflectionTestUtils.setField(listener, "exchange", "bicap_exchange");
        ReflectionTestUtils.setField(listener, "responseRoutingKey", "response");
        BlockchainRecord batch = new BlockchainRecord(); batch.setBlockchainTx("batch-tx");
        BlockchainRecord process = new BlockchainRecord(); process.setBlockchainTx("process-tx");
        when(service.write(1L, "BATCH", "batch-hash")).thenReturn(batch);
        when(service.write(1L, "PROCESS", "process-hash")).thenReturn(process);
        listener.receiveMessage(new BlockchainMessage("1", "BATCH", "batch-hash", "today"));
        listener.receiveMessage(new BlockchainMessage("1", "PROCESS", "process-hash", "today"));
        ArgumentCaptor<BlockchainResult> results = ArgumentCaptor.forClass(BlockchainResult.class);
        verify(rabbit, times(2)).convertAndSend(eq("bicap_exchange"), eq("response"), results.capture());
        assertTrue(results.getAllValues().stream().allMatch(BlockchainResult::isSuccess));
        assertEquals("batch-tx", results.getAllValues().get(0).getTransactionId());
        assertEquals("process-tx", results.getAllValues().get(1).getTransactionId());
        assertEquals("PROCESS", results.getAllValues().get(1).getResourceType());
        verify(service, never()).getBlockchainInfo(anyLong());
    }
}
