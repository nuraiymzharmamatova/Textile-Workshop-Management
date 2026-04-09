package kg.workshop.erp.service;

import kg.workshop.erp.dto.request.ClientRequest;
import kg.workshop.erp.entity.Client;

import java.util.List;

public interface ClientService {
    List<Client> getAll();
    Client getById(Long id);
    Client create(ClientRequest request);
    Client update(Long id, ClientRequest request);
    void delete(Long id);
    List<Client> search(String query);
}
