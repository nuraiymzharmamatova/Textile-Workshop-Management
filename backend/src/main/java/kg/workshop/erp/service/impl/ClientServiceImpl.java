package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.request.ClientRequest;
import kg.workshop.erp.entity.Client;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.ClientRepository;
import kg.workshop.erp.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Client> getAll() {
        return clientRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Client getById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id));
    }

    @Override
    public Client create(ClientRequest request) {
        Client client = Client.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .notes(request.getNotes())
                .build();
        return clientRepository.save(client);
    }

    @Override
    public Client update(Long id, ClientRequest request) {
        Client client = getById(id);
        client.setName(request.getName());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setNotes(request.getNotes());
        return clientRepository.save(client);
    }

    @Override
    public void delete(Long id) {
        Client client = getById(id);
        clientRepository.delete(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Client> search(String query) {
        return clientRepository.findByNameContainingIgnoreCase(query);
    }
}
