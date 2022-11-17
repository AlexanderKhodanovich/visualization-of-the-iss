class Animation {
    constructor(pos, img) {
        this.root_modules = [10];
        this.positions = pos;
        this.images = img;
        this.move_scalar = 30;
        
        // initialized on each call of animate()
        this.queue_promises = [];
        this.queue_resolvers = [];
        this.ends = [];
        this.n_active_ends = 0;
        this.done = null;
        this.moves = null;
    }
    
    init_ends(mod_id) {
        if (this.positions[mod_id].children.length == 0)
            this.ends.push(mod_id);
        else {
            this.positions[mod_id].children.forEach(ch => {
                this.init_ends(ch);
            });
        }
    }

    move(mv, step_done) {
        var [x, y] = move_in_3d((+this.images[mv.id].select("image").attr("x")),
                                  (+this.images[mv.id].select("image").attr("y")),
                                  mv.v);

        this.images[mv.id].select("image")
            .datum([this, step_done])
            .transition()
            .duration(500)
            .ease(d3.easeExp)
            .attr("x", x)
            .attr("y", y)
            .on("end", function(args) {
                // if the current end module initiated the move
                if (args[0].ends.includes(mv.id) && mv.root == true)
                    args[0].n_active_ends--;  // then this was its last move
                
                // resolve the step promise
                args[1](args[0]);
            
                // if no more active ends left
                if (args[0].n_active_ends == 0) {
                    args[0].queue_promises.shift();
                    args[0].queue_resolvers.shift()(args[0]) // resolve
                }
            });
    }
    
    apply_moves(i=0) {
        var step_done;
        var promise_step = new Promise(resolve => {
            step_done = resolve;
        });
        
        this.moves[i].forEach(mv => {
            this.move(mv, step_done);
        });
        
        promise_step.then(function(context) {
            console.log("step done", i);
            if (context.moves.length > ++i)
                context.apply_moves(i);
        });
    }
    
    construct_moves(reverse = false) {
        const positions = this.positions;
        
        function get_all_children(id, res) {
            positions[id].children.forEach(ch => {
                res.add(ch);
                res = get_all_children(ch, res);
            });
            return res;
        }
        
        function get_all_parents(id, res) {
            res.add(positions[id].parent);
            if (positions[id].parent != -1)
                res = get_all_parents(positions[id].parent, res);
            return res;
        }
        
        function construct(positions, ids, scalar, reverse=false, moves=[]) {
            if (reverse == false)
                var mult = 1;
            else
                var mult = -1;
            
            var moves_one_step = [];
            ids.forEach((id, i) => {
                positions[id].moves.forEach((mv, j) => {
                    if (mv.direction == "-x") {
                        var v = [-mv.d*scalar*mult, 0, 0];
                    } else if (mv.direction == "+x") {
                        var v = [mv.d*scalar*mult, 0, 0];
                    } else if (mv.direction == "-y") {
                        var v = [0, -mv.d*scalar*mult, 0];
                    } else if (mv.direction == "+y") {
                        var v = [0, mv.d*scalar*mult, 0];
                    } else if (mv.direction == "-z") {
                        var v = [0, 0, -mv.d*scalar*mult];
                    } else if (mv.direction == "+z") {
                        var v = [0, 0, mv.d*scalar*mult];
                    }
                    var mods = get_all_children(id, new Set());
                    if (reverse == false)
                        moves_one_step.push({id:id, v:v, root:true});
                    mods.forEach(m => {
                        // append moves of the children
                        moves_one_step.push({id:m, v:v, root:false});  
                    })
                    if (reverse == true)
                        moves_one_step.push({id:id, v:v, root:true});
                });
            });
            moves.push(moves_one_step);
            
            var c = [];
            ids.forEach(id => {
                c = c.concat(positions[id].children);
            });
            
            if (c.length != 0)
                moves = construct(positions, c, scalar, reverse, moves);
            
            return moves;
        }
        
        var moves = construct(this.positions, this.root_modules, this.move_scalar, reverse);
        if (reverse == true)
            return moves.reverse();
        else
            return moves;
    }
    
    animate_ready(reverse) {
        if (reverse == true) {
            // init ends as roots
            this.ends = this.root_modules;
            this.n_active_ends = this.root_modules.length;
        } else {
            // init ends as leaves (with no children)
            this.root_modules.forEach(mid => { this.init_ends(mid); });
            this.n_active_ends = this.ends.length;
        }
        
        // construct moves
        this.moves = this.construct_moves(reverse);
        
        // apply moves
        this.apply_moves();
    }
    
    animate(reverse = false) {
        // create the animation promise and a function to resolve it
        var done;
        var animate_promise = new Promise(resolve => {
            done = resolve;
        });
        
        // if no animations in queue
        if (this.queue_promises.length == 0) {
            // add animation to the queue
            this.queue_promises.push(animate_promise);
            this.queue_resolvers.push(done);
            
            console.log("Started animation"); 
            // animate
            this.animate_ready(reverse);
        }
        // otherwise
        else {
            var other_promises = Promise.all(this.queue_promises);
            
            // add animation to the queue
            this.queue_promises.push(animate_promise);
            this.queue_resolvers.push(done);
            
            // wait for previous animations
            other_promises.then(function(context) {
                console.log("Started animation"); 
                context[0].animate_ready(reverse); 
            });
        }
        animate_promise.then(function(context) {
            context.ends = [];
            console.log("finished animation"); 
        });
    }
}