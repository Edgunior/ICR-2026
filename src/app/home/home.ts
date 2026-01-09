import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  toys = signal<ToyModel[]>([]);          
  filteredToys = signal<ToyModel[]>([]);   
  search = '';                             

  ngOnInit() {
    this.loadToys();
  }

  async loadToys() {
    const allToys = await ToyService.getAllToys();
    this.toys.set(allToys);
    this.filteredToys.set(allToys); 
  }

  onSearch(query: string) {
    this.search = query;
    const filtered = ToyService.searchToys(this.toys(), query);
    this.filteredToys.set(filtered);
  }
}
