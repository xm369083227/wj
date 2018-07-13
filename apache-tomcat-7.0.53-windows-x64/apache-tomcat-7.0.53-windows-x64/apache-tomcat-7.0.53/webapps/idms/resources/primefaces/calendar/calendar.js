PrimeFaces.widget.Calendar = PrimeFaces.widget.BaseWidget
		.extend({
			init : function(b) {
				this._super(b);
				this.input = $(this.jqId + "_input");
				this.jqEl = this.cfg.popup ? this.input : $(this.jqId
						+ "_inline");
				var a = this;
				this.configureLocale();
				this.bindDateSelectListener();
				this.bindViewChangeListener();
				this.cfg.beforeShowDay = function(f) {
					if (a.cfg.preShowDay) {
						return a.cfg.preShowDay(f)
					} else {
						if (a.cfg.disabledWeekends) {
							return $.datepicker.noWeekends(f)
						} else {
							return [ true, "" ]
						}
					}
				};
				var d = this.hasTimePicker();
				if (d) {
					this.configureTimePicker()
				}
				if (this.cfg.popup) {
					PrimeFaces.skinInput(this.jqEl);
					if (this.cfg.behaviors) {
						PrimeFaces.attachBehaviors(this.jqEl,
								this.cfg.behaviors)
					}
					this.cfg.beforeShow = function() {
						setTimeout(function() {
							$("#ui-datepicker-div").css("z-index",
									++PrimeFaces.zindex)
						}, 250)
					}
				}
				if (!this.input.attr("readonly") && this.cfg.showOn
						&& this.cfg.showOn === "button") {
					this.cfg.beforeShow = function(f, g) {
						$(this).attr("readonly", true)
					};
					this.cfg.onClose = function(g, f) {
						$(this).attr("readonly", false)
					}
				}
				if (!this.cfg.disabled) {
					if (d) {
						if (this.cfg.timeOnly) {
							this.jqEl.timepicker(this.cfg)
						} else {
							this.jqEl.datetimepicker(this.cfg)
						}
					} else {
						this.jqEl.datepicker(this.cfg)
					}
				}
				if (this.cfg.popup && this.cfg.showOn) {
					var c = this.jqEl.siblings(".ui-datepicker-trigger:button");
					c
							.html("")
							.addClass(
									"ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only")
							.append(
									'<span class="ui-button-icon-left ui-icon ui-icon-calendar"></span><span class="ui-button-text">ui-button</span>');
					var e = this.jqEl.attr("title");
					if (e) {
						c.attr("title", e)
					}
					PrimeFaces.skinButton(c);
					$("#ui-datepicker-div").addClass("ui-shadow")
				}
				if (this.cfg.popup) {
					this.jq.data("primefaces-overlay-target", this.id)
							.find("*").data("primefaces-overlay-target",
									this.id)
				}
				this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
				if (this.cfg.mask) {
					this.input.mask(this.cfg.mask)
				}
			},
			refresh : function(a) {
				if (a.popup && $.datepicker._lastInput
						&& (a.id + "_input") === $.datepicker._lastInput.id) {
					$.datepicker._hideDatepicker()
				}
				this.init(a)
			},
			configureLocale : function() {
				var a = PrimeFaces.locales[this.cfg.locale];
				if (a) {
					for ( var b in a) {
						this.cfg[b] = a[b]
					}
				}
			},
			bindDateSelectListener : function() {
				var a = this;
				this.cfg.onSelect = function() {
					if (a.cfg.popup) {
						a.fireDateSelectEvent()
					} else {
						var b = $.datepicker.formatDate(a.cfg.dateFormat, a
								.getDate());
						a.input.val(b);
						a.fireDateSelectEvent()
					}
				}
			},
			fireDateSelectEvent : function() {
				if (this.cfg.behaviors) {
					var a = this.cfg.behaviors.dateSelect;
					if (a) {
						a.call(this)
					}
				}
			},
			bindViewChangeListener : function() {
				if (this.hasBehavior("viewChange")) {
					var a = this;
					this.cfg.onChangeMonthYear = function(b, c) {
						a.fireViewChangeEvent(b, c)
					}
				}
			},
			fireViewChangeEvent : function(b, c) {
				if (this.cfg.behaviors) {
					var d = this.cfg.behaviors.viewChange;
					if (d) {
						var a = {
							params : [ {
								name : this.id + "_month",
								value : c
							}, {
								name : this.id + "_year",
								value : b
							} ]
						};
						d.call(this, a)
					}
				}
			},
			configureTimePicker : function() {
				var b = this.cfg.dateFormat, a = b.toLowerCase().indexOf("h");
				this.cfg.dateFormat = b.substring(0, a - 1);
				this.cfg.timeFormat = b.substring(a, b.length);
				if (this.cfg.timeFormat.indexOf("ss") != -1) {
					this.cfg.showSecond = true
				}
				if (this.cfg.timeFormat.indexOf("TT") != -1) {
					this.cfg.ampm = true
				}
				if (this.cfg.minDate) {
					this.cfg.minDate = $.datepicker.parseDateTime(
							this.cfg.dateFormat, this.cfg.timeFormat,
							this.cfg.minDate, {}, {})
				}
				if (this.cfg.maxDate) {
					this.cfg.maxDate = $.datepicker.parseDateTime(
							this.cfg.dateFormat, this.cfg.timeFormat,
							this.cfg.maxDate, {}, {})
				}
				if (!this.cfg.showButtonPanel) {
					this.cfg.showButtonPanel = false
				}
			},
			hasTimePicker : function() {
				return this.cfg.dateFormat.toLowerCase().indexOf("h") != -1
			},
			setDate : function(a) {
				this.jqEl.datetimepicker("setDate", a)
			},
			getDate : function() {
				return this.jqEl.datetimepicker("getDate")
			},
			enable : function() {
				this.jqEl.datetimepicker("enable")
			},
			disable : function() {
				this.jqEl.datetimepicker("disable")
			},
			hasBehavior : function(a) {
				if (this.cfg.behaviors) {
					return this.cfg.behaviors[a] !== undefined
				}
				return false
			}
		});