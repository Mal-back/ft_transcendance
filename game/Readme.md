pour le ranking dans les tournois:
les classes dans le div de base c'est :
    1er -> gold
    2eme -> silver
    3eme -> bronze
    4eme,etc. -> black

voila a quoi ressemble une div a append pour le 1er:
```html
<div>
    <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
        <div class="d-flex align-items-center">
            <div class="ranking-number gold">1</div>
            <div class="Avatar status-online me-3"></div>
            <div class="flex-fill">
                <h5 class="mb-0">USERNAME</h5>
            </div>
        </div>
        <div class="score">
            <span>WINS: 1</span>
            <br>
            <span>LOSS: 2</span>
        </div>
    </div>
</div>
```